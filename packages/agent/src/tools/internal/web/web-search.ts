import { tool } from "ai";
import { z } from "zod";

import { env } from "@mono/env";
import { InternalServerError } from "@mono/errors";

import type { ToolMetadata } from "../../../types";

const EXA_SEARCH_URL = "https://api.exa.ai/search";
const FETCH_TIMEOUT_MS = 30_000;
const HIGHLIGHT_MAX_CHARACTERS = 500;
const DEFAULT_NUM_RESULTS = 10;
const MAX_NUM_RESULTS = 20;
const SEARCH_TYPE = "auto";

const exaCategorySchema = z.enum([
  "company",
  "research paper",
  "news",
  "pdf",
  "github",
  "tweet",
  "personal site",
  "linkedin profile",
  "financial report",
]);

const inputSchema = z.object({
  query: z.string().min(1).describe("Natural-language search query."),
  numResults: z
    .number()
    .int()
    .min(1)
    .max(MAX_NUM_RESULTS)
    .default(DEFAULT_NUM_RESULTS)
    .describe(`Number of results to return (1-${MAX_NUM_RESULTS}).`),
  category: exaCategorySchema
    .optional()
    .describe(
      "OPTIONAL content category to bias retrieval. Set 'news' for current-events queries, 'research paper' for academic, etc. Omit if the query type is mixed or unclear.",
    ),
});

const exaSearchResponseSchema = z.object({
  requestId: z.string().optional(),
  results: z.array(
    z.object({
      title: z.string().nullable().optional(),
      url: z.string(),
      publishedDate: z.string().nullable().optional(),
      author: z.string().nullable().optional(),
      highlights: z.array(z.string()).optional(),
    }),
  ),
  costDollars: z
    .object({
      total: z.number().optional(),
    })
    .optional(),
});

export const WEB_SEARCH_METADATA: ToolMetadata = {
  name: "webSearch",
  description:
    "Search the web. Returns each result with title, URL, published date, and short query-relevant highlight excerpts. Does NOT return full page text.",
  usage:
    "Default to passing only `query` (and `category` when the query type is clear). Read the highlights to triage; if you need a page's full content, pass its URL to fetchWebPages.",
};

export function createWebSearchTool() {
  return tool({
    description: WEB_SEARCH_METADATA.description,
    inputSchema,
    execute: async ({ query, numResults, category }) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const response = await fetch(EXA_SEARCH_URL, {
          method: "POST",
          headers: {
            "x-api-key": env.EXA_API_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            query,
            numResults,
            type: SEARCH_TYPE,
            ...(category ? { category } : {}),
            contents: {
              highlights: {
                query,
                maxCharacters: HIGHLIGHT_MAX_CHARACTERS,
              },
            },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          throw new InternalServerError("Exa search request failed", {
            details: { status: response.status, body: body.slice(0, 500) },
          });
        }

        const json: unknown = await response.json();
        const parsed = exaSearchResponseSchema.parse(json);

        return {
          requestId: parsed.requestId,
          results: parsed.results.map((result) => ({
            title: result.title ?? null,
            url: result.url,
            publishedDate: result.publishedDate ?? null,
            author: result.author ?? null,
            highlights: result.highlights ?? [],
          })),
        };
      } finally {
        clearTimeout(timeout);
      }
    },
  });
}
