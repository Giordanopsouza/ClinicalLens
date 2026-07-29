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

type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
};

type GroundednessReport = {
  score: number;
  verdict: "high" | "medium" | "low";
  supported_claims: number;
  total_claims: number;
  unsupported_claims: string[];
  cited_urls: string[];
};

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "for", "to", "of", "in", "on",
  "at", "by", "with", "as", "from", "is", "are", "was", "were", "be", "been",
  "this", "that", "these", "those", "it", "its", "into", "than", "then",
  "can", "could", "should", "would", "may", "might", "will", "also", "about",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function sentenceCoverageRatio(sentence: string, sourceTokens: Set<string>): number {
  const tokens = tokenize(sentence);
  if (tokens.length === 0) return 0;
  const covered = tokens.filter((token) => sourceTokens.has(token)).length;
  return covered / tokens.length;
}

function computeGroundedness(answer: string | undefined, results: TavilyResult[]): GroundednessReport | undefined {
  if (!answer || !answer.trim()) return undefined;

  const claims = answer
    .split(/[.!?]\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 25);

  if (claims.length === 0) return undefined;

  const sourceTokens = new Set<string>();
  for (const result of results) {
    for (const token of tokenize(`${result.title} ${result.content}`)) {
      sourceTokens.add(token);
    }
  }

  const supportedClaims = claims.filter(
    (claim) => sentenceCoverageRatio(claim, sourceTokens) >= 0.35
  );
  const unsupportedClaims = claims.filter(
    (claim) => sentenceCoverageRatio(claim, sourceTokens) < 0.35
  );

  const score = supportedClaims.length / claims.length;
  const verdict: GroundednessReport["verdict"] =
    score >= 0.8 ? "high" : score >= 0.5 ? "medium" : "low";

  return {
    score,
    verdict,
    supported_claims: supportedClaims.length,
    total_claims: claims.length,
    unsupported_claims: unsupportedClaims.slice(0, 5),
    cited_urls: results.slice(0, 5).map((result) => result.url),
  };
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
        source: z.string().optional(),
        published_date: z.string().optional(),
        evidence_strength: z.enum(["high", "moderate", "low", "unclear"]).optional(),
      })
    ),
    answer: z.string().optional(),
    groundedness: z
      .object({
        score: z.number(),
        verdict: z.enum(["high", "medium", "low"]),
        supported_claims: z.number(),
        total_claims: z.number(),
        unsupported_claims: z.array(z.string()),
        cited_urls: z.array(z.string()),
      })
      .optional(),
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

    const getSource = (url: string) => {
      if (url.includes("pubmed.ncbi.nlm.nih.gov")) return "PubMed";
      if (url.includes("nih.gov")) return "NIH";
      if (url.includes("fda.gov")) return "FDA";
      if (url.includes("who.int")) return "WHO";
      if (url.includes("uptodate.com")) return "UpToDate";
      if (url.includes("medscape.com")) return "Medscape";
      if (url.includes("mayoclinic.org")) return "Mayo Clinic";
      if (url.includes("nejm.org")) return "NEJM";
      if (url.includes("thelancet.com")) return "The Lancet";
      return new URL(url).hostname.replace("www.", "");
    };

    const getEvidenceStrength = (source: string, content: string): "high" | "moderate" | "low" | "unclear" => {
      const highValueSources = ["NEJM", "The Lancet", "PubMed", "FDA", "NIH"];
      const lowerContent = content.toLowerCase();
      if (highValueSources.includes(source) || lowerContent.includes("meta-analysis") || lowerContent.includes("randomized controlled trial")) {
        return "high";
      }
      if (lowerContent.includes("observational study") || lowerContent.includes("cohort study")) {
        return "moderate";
      }
      return "unclear";
    };

    const normalizedResults = (response.results as TavilyResult[]).map((r) => {
      const source = getSource(r.url);
      return {
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
        source,
        published_date: r.published_date,
        evidence_strength: getEvidenceStrength(source, r.content),
      };
    });

    const answer = response.answer || undefined;
    const groundedness = computeGroundedness(answer, response.results as TavilyResult[]);

    return {
      query: searchQuery,
      results: normalizedResults,
      answer,
      groundedness,
    };
  },
});
