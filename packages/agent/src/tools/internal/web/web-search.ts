import { tool } from "ai";
import { z } from "zod";

import { env } from "@microlearn/env";
import { InternalServerError } from "@microlearn/errors";

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
  query: z
    .string()
    .min(1)
    .describe(
      "Natural-language search query. Use plain semantic phrasing; do NOT repeat date constraints in the query text — pass them via startPublishedDate/endPublishedDate instead.",
    ),
  numResults: z
    .number()
    .int()
    .min(1)
    .max(MAX_NUM_RESULTS)
    .default(DEFAULT_NUM_RESULTS)
    .describe(`Number of results to return (1-${MAX_NUM_RESULTS}).`),
  startPublishedDate: z.iso
    .datetime()
    .optional()
    .describe(
      "OPTIONAL ISO 8601 timestamp. Only set this when the user explicitly asks for time-bounded results (e.g. 'news from this week', 'articles since March'). Omit otherwise — Exa already prioritizes recent content. Note: Exa's date filtering is best-effort, not strict.",
    ),
  endPublishedDate: z.iso
    .datetime()
    .optional()
    .describe(
      "OPTIONAL ISO 8601 timestamp. Only set this when the user explicitly asks for an upper time bound. Omit otherwise.",
    ),
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
    "Default to passing only `query` (and `category` when the query type is clear). Leave date filters unset unless the user explicitly asked for a time window — Exa already prioritizes recent content. Read the highlights to triage; if you need a page's full content, pass its URL to fetchWebPages.",
};

export function createWebSearchTool() {
  return tool({
    description: WEB_SEARCH_METADATA.description,
    inputSchema,
    execute: async ({
      query,
      numResults,
      startPublishedDate,
      endPublishedDate,
      category,
    }) => {
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
            ...(startPublishedDate ? { startPublishedDate } : {}),
            ...(endPublishedDate ? { endPublishedDate } : {}),
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

        if (parsed.costDollars?.total != null) {
          console.log(
            `[webSearch] cost=$${parsed.costDollars.total.toFixed(4)} results=${parsed.results.length} query=${JSON.stringify(query)}`,
          );
        }

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
