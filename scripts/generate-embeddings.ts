import { ConvexHttpClient } from "convex/browser";

import { api } from "../convex/_generated/api";
import { parseCsvGz } from "./parse-csv";
import { loadEnvLocal } from "./load-env";

loadEnvLocal();

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required in .env.local");
}

const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required in .env.local");
}

const client = new ConvexHttpClient(convexUrl);

const rawModelName = process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";
const modelName = rawModelName.startsWith("models/")
  ? rawModelName
  : `models/${rawModelName}`;

const outputDimensionality = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS ?? "1536");
if (!Number.isFinite(outputDimensionality) || outputDimensionality <= 0) {
  throw new Error("GEMINI_EMBEDDING_DIMENSIONS must be a positive number");
}

interface ClinicalCaseRow extends Record<string, unknown> {
  hadm_id: unknown;
  discharge_summary: unknown;
}

function chunk<T>(items: T[], size: number): T[][] {
  const output: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

interface GeminiEmbeddingResponse {
  embedding?: {
    values?: number[];
  };
}

async function createGeminiEmbedding(text: string): Promise<number[]> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelName}:embedContent`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiApiKey,
    },
    body: JSON.stringify({
      model: modelName,
      content: {
        parts: [{ text }],
      },
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini embeddings request failed (${response.status}): ${errorBody}`);
  }

  const parsed = (await response.json()) as GeminiEmbeddingResponse;
  const values = parsed.embedding?.values;
  if (!values || values.length === 0) {
    throw new Error("Gemini embeddings response did not include embedding values");
  }

  return values;
}

async function generateEmbeddings(): Promise<void> {
  const rows = parseCsvGz<ClinicalCaseRow>("clinical_cases.csv.gz");
  const cases = rows
    .map((row) => {
      const hadmId = toNumber(row.hadm_id);
      if (hadmId === null) {
        return null;
      }

      return {
        hadm_id: hadmId,
        discharge_summary: String(row.discharge_summary ?? ""),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const batches = chunk(cases, 20);
  console.log(`Generating Gemini embeddings for ${cases.length} clinical cases...`);

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const embeddings = await Promise.all(
      batch.map((item) => createGeminiEmbedding(item.discharge_summary.slice(0, 8000))),
    );

    for (let itemIndex = 0; itemIndex < batch.length; itemIndex += 1) {
      await client.mutation(api.mutations.updateCaseEmbedding, {
        hadm_id: batch[itemIndex].hadm_id,
        embedding: embeddings[itemIndex],
      });
    }

    console.log(`  batch ${index + 1}/${batches.length}`);
  }

  console.log("Embedding generation complete.");
}

generateEmbeddings().catch((error) => {
  console.error("Embedding generation failed:", error);
  process.exitCode = 1;
});
