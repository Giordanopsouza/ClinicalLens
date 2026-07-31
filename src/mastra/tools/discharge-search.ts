import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getConvexClient } from "./convex-client";
import { api } from "@/convex/_generated/api";

async function createQueryEmbedding(query: string): Promise<number[]> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    const openai = new OpenAI({ apiKey: openAiKey });
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    return embeddingResponse.data[0].embedding;
  }

  const googleKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!googleKey) {
    throw new Error(
      "Missing embedding API key. Set OPENAI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY."
    );
  }

  const modelName = process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";
  const genAI = new GoogleGenerativeAI(googleKey);
  const model = genAI.getGenerativeModel({ model: modelName });
  const response = await model.embedContent(query);
  const embedding = response.embedding?.values;

  if (!embedding?.length) {
    throw new Error("Gemini embedding request returned no embedding values.");
  }

  return embedding;
}

export const dischargeSummarySearchTool = createTool({
  id: "discharge-summary-search",
  description:
    "Semantically search across all patient discharge summaries to find similar cases. Useful for finding patients with similar presentations, conditions, or outcomes. Input a natural language clinical query.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Natural language clinical query to search for in discharge summaries, e.g. 'patient with acute kidney injury and sepsis requiring dialysis'"
      ),
    limit: z
      .number()
      .optional()
      .describe("Number of results to return (default 5)"),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(
      z.object({
        hadm_id: z.number(),
        age: z.number(),
        gender: z.string(),
        admission_diagnosis: z.string(),
        summary_preview: z.string(),
        score: z.number(),
      })
    ),
  }),
  execute: async ({ query, limit }, { requestContext }) => {
    const token = requestContext?.get("convexToken") as string | undefined;
    const queryEmbedding = await createQueryEmbedding(query);

    const client = getConvexClient(token);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await client.action((api as any).actions.searchDischargeSummaries, {
      embedding: queryEmbedding,
      limit: limit ?? 5,
    });

    return {
      query,
      results: (results || []).map(
        (r: {
          hadm_id: number;
          age: number;
          gender: string;
          admission_diagnosis: string;
          discharge_summary?: string;
          score?: number;
        }) => ({
          hadm_id: r.hadm_id,
          age: r.age,
          gender: r.gender,
          admission_diagnosis: r.admission_diagnosis,
          summary_preview:
            (r.discharge_summary || "").slice(0, 500) + "...",
          score: r.score || 0,
        })
      ),
    };
  },
});
