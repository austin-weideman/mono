import { tool } from "ai";
import { z } from "zod";

import { env } from "@microlearn/env";
import { InternalServerError } from "@microlearn/errors";

import type { ToolMetadata } from "../../../types";

const EXA_CONTENTS_URL = "https://api.exa.ai/contents";
const FETCH_TIMEOUT_MS = 30_000;
const TEXT_MAX_CHARACTERS = 8_000;
const MAX_URLS_PER_CALL = 10;

const inputSchema = z.object({
  urls: z
    .array(z.url())
    .min(1)
    .max(MAX_URLS_PER_CALL)
    .describe(
      `URLs to extract full page text from (1-${MAX_URLS_PER_CALL}). Typically these are URLs returned by webSearch.`,
    ),
});

const exaContentsResponseSchema = z.object({
  requestId: z.string().optional(),
  results: z.array(
    z.object({
      url: z.string(),
      title: z.string().nullable().optional(),
      author: z.string().nullable().optional(),
      publishedDate: z.string().nullable().optional(),
      text: z.string().nullable().optional(),
    }),
  ),
  costDollars: z
    .object({
      total: z.number().optional(),
    })
    .optional(),
});

export const FETCH_WEB_PAGES_METADATA: ToolMetadata = {
  name: "fetchWebPages",
  description:
    "Fetch the full text of one or more web pages by URL. Returns clean, LLM-ready markdown text per page (truncated to a reasonable length).",
  usage:
    "Use after webSearch to read the full content of pages whose highlights looked promising. Pass multiple URLs in a single call to batch the request.",
};

export function createFetchWebPagesTool() {
  return tool({
    description: FETCH_WEB_PAGES_METADATA.description,
    inputSchema,
    execute: async ({ urls }) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const response = await fetch(EXA_CONTENTS_URL, {
          method: "POST",
          headers: {
            "x-api-key": env.EXA_API_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            urls,
            text: { maxCharacters: TEXT_MAX_CHARACTERS },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          throw new InternalServerError("Exa contents request failed", {
            details: { status: response.status, body: body.slice(0, 500) },
          });
        }

        const json: unknown = await response.json();
        const parsed = exaContentsResponseSchema.parse(json);

        if (parsed.costDollars?.total != null) {
          console.log(
            `[fetchWebPages] cost=$${parsed.costDollars.total.toFixed(4)} pages=${parsed.results.length}`,
          );
        }

        return {
          requestId: parsed.requestId,
          results: parsed.results.map((result) => ({
            url: result.url,
            title: result.title ?? null,
            author: result.author ?? null,
            publishedDate: result.publishedDate ?? null,
            text: result.text ?? "",
          })),
        };
      } finally {
        clearTimeout(timeout);
      }
    },
  });
}
