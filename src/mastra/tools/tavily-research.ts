import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";
import { deidentifyForExternalUse } from "./presidio-deid";

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
        source: z.string().optional(),
        published_date: z.string().optional(),
        evidence_strength: z.enum(["high", "moderate", "low", "unclear"]).optional(),
      })
    ),
    answer: z.string().optional(),
    citations: z.array(z.string()).optional(),
    safety_disclaimer: z.string().optional(),
    deidentification: z
      .object({
        redacted: z.boolean(),
        entities_detected: z.number(),
      })
      .optional(),
  }),
  execute: async ({ query, icd9_code, search_depth }) => {
    const tavilyClient = getTavilyClient();
    const deid = await deidentifyForExternalUse(query);

    const safeQuery = deid.sanitizedText;
    const searchQuery = icd9_code
      ? `${safeQuery} ICD-9 ${icd9_code} clinical guidelines`
      : safeQuery;

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

    const normalizedResults = (response.results as Array<{
      title: string;
      url: string;
      content: string;
      score: number;
      published_date?: string;
    }>).map((r) => {
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

    const citations = normalizedResults.slice(0, 3).map((result) => result.url);
    const safetyDisclaimer =
      "Clinical decision support only. Verify guidance against local protocols and clinician judgment.";

    const answerBase =
      (response.answer?.trim() && response.answer.trim().length > 0
        ? response.answer.trim()
        : `Retrieved ${normalizedResults.length} relevant guideline sources for "${searchQuery}".`) ?? "";

    const groundedAnswer =
      citations.length > 0
        ? `${answerBase}\n\nSources:\n${citations.map((url) => `- ${url}`).join("\n")}\n\n${safetyDisclaimer}`
        : `${answerBase}\n\n${safetyDisclaimer}`;

    return {
      query: searchQuery,
      results: normalizedResults,
      answer: groundedAnswer,
      citations,
      safety_disclaimer: safetyDisclaimer,
      deidentification: {
        redacted: deid.redacted,
        entities_detected: deid.entitiesDetected,
      },
    };
  },
});
