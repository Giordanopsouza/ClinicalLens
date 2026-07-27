import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";

let _tavilyClient: ReturnType<typeof tavily> | null = null;

function getTavilyClient() {
  if (!_tavilyClient) {
    _tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! });
  }
  return _tavilyClient;
}

export const tavilyResearchTool = createTool({
  id: "tavily-research",
  description:
    "Search the public internet for current medical guidelines, clinical trials, FDA updates, or PubMed research related to a diagnosis or clinical question. Use this when a user asks about treatment protocols, drug interactions, or wants to explore the latest evidence for a condition. Provide a focused medical search query.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "A focused medical search query, e.g. '2026 treatment guidelines for ICD-9 428.0 congestive heart failure'"
      ),
    icd9_code: z
      .string()
      .optional()
      .describe(
        "Optional ICD-9 code to include in the search for precision"
      ),
    search_depth: z
      .enum(["basic", "advanced"])
      .optional()
      .describe(
        "Search depth: basic (faster) or advanced (more thorough). Default: advanced"
      ),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        content: z.string(),
        score: z.number(),
      })
    ),
    answer: z.string().optional(),
  }),
  execute: async ({ query, icd9_code, search_depth }) => {
    const tavilyClient = getTavilyClient();

    const searchQuery = icd9_code
      ? `${query} ICD-9 ${icd9_code} clinical guidelines`
      : query;

    const response = await tavilyClient.search(searchQuery, {
      searchDepth: search_depth || "advanced",
      maxResults: 5,
      includeAnswer: true,
      includeDomains: [
        "pubmed.ncbi.nlm.nih.gov",
        "nih.gov",
        "fda.gov",
        "who.int",
        "uptodate.com",
        "medscape.com",
        "mayoclinic.org",
        "nejm.org",
        "thelancet.com",
      ],
    });

    return {
      query: searchQuery,
      results: response.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      answer: response.answer || undefined,
    };
  },
});
