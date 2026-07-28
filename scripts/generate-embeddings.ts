import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { parseCsvGz } from "./parse-csv";
import { loadEnvLocal } from "./load-env";

loadEnvLocal();

const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required in .env.local");
}

const rawModelName = process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";
const modelName = rawModelName.startsWith("models/")
  ? rawModelName
  : `models/${rawModelName}`;

const outputDimensionality = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS ?? "1536");
if (!Number.isFinite(outputDimensionality) || outputDimensionality <= 0) {
  throw new Error("GEMINI_EMBEDDING_DIMENSIONS must be a positive number");
}

// Batch size for batchEmbedContents — Gemini supports up to 100 per request
const BATCH_SIZE = 50;
// Delay between batch requests (ms) — keeps us within rate limits
const BATCH_DELAY_MS = 2000;

const IMPORT_DIR = path.join(process.cwd(), "data", "_convex_import");

interface ClinicalCaseRow extends Record<string, unknown> {
  case_id: unknown;
  subject_id: unknown;
  hadm_id: unknown;
  age: unknown;
  gender: unknown;
  admission_diagnosis: unknown;
  discharge_summary: unknown;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function chunk<T>(items: T[], size: number): T[][] {
  const output: T[][] = [];
  for (let i = 0; i < items.length; i += size) output.push(items.slice(i, i + size));
  return output;
}

interface BatchEmbedResponse {
  embeddings?: Array<{ values?: number[] }>;
}

async function batchCreateEmbeddings(texts: string[], retries = 5): Promise<number[][]> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelName}:batchEmbedContents`;

  const requests = texts.map((text) => ({
    model: modelName,
    content: { parts: [{ text: text.slice(0, 8000) }] },
    taskType: "RETRIEVAL_DOCUMENT",
    outputDimensionality,
  }));

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({ requests }),
    });

    if (response.status === 429 || response.status >= 500) {
      if (attempt === retries) {
        const errorBody = await response.text();
        throw new Error(`Gemini request failed (${response.status}) after ${retries} retries: ${errorBody}`);
      }
      const waitMs = Math.pow(2, attempt) * 3000;
      console.warn(`  HTTP ${response.status}, waiting ${waitMs / 1000}s before retry ${attempt + 1}/${retries}...`);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini batch embeddings failed (${response.status}): ${errorBody}`);
    }

    const parsed = (await response.json()) as BatchEmbedResponse;
    if (!parsed.embeddings || parsed.embeddings.length !== texts.length) {
      throw new Error(`Expected ${texts.length} embeddings, got ${parsed.embeddings?.length ?? 0}`);
    }

    return parsed.embeddings.map((e, i) => {
      if (!e.values || e.values.length === 0) {
        throw new Error(`Embedding ${i} has no values`);
      }
      return e.values;
    });
  }

  throw new Error("Unreachable");
}

function runConvexImport(table: string, filePath: string): void {
  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const args = [
    "convex",
    "import",
    "-y",
    "--replace",
    "--format",
    "jsonLines",
    "--table",
    table,
    filePath,
  ];
  const result = spawnSync(npxCmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`convex import failed for table "${table}"`);
  }
}

async function generateEmbeddings(): Promise<void> {
  const sourceRows = parseCsvGz<ClinicalCaseRow>("clinical_cases.csv.gz");
  const cases = sourceRows
    .map((row) => {
      const subjectId = toNumber(row.subject_id);
      const hadmId = toNumber(row.hadm_id);
      const age = toNumber(row.age);
      if (subjectId === null || hadmId === null || age === null) return null;
      return {
        case_id: toStringValue(row.case_id),
        subject_id: subjectId,
        hadm_id: hadmId,
        age,
        gender: toStringValue(row.gender),
        admission_diagnosis: toStringValue(row.admission_diagnosis),
        discharge_summary: toStringValue(row.discharge_summary),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const batches = chunk(cases, BATCH_SIZE);
  console.log(
    `Generating embeddings for ${cases.length} cases in ${batches.length} batches of ${BATCH_SIZE}...\n`,
  );

  const casesWithEmbeddings: Array<typeof cases[number] & { embedding: number[] }> = [];

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const texts = batch.map((item) => item.discharge_summary);
    const embeddings = await batchCreateEmbeddings(texts);

    for (let i = 0; i < batch.length; i++) {
      casesWithEmbeddings.push({ ...batch[i], embedding: embeddings[i] });
    }

    console.log(`  batch ${index + 1}/${batches.length} (${batch.length} embeddings)`);

    if (index < batches.length - 1) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log("\nWriting clinical_cases with embeddings to JSONL...");
  fs.mkdirSync(IMPORT_DIR, { recursive: true });
  const filePath = path.join(IMPORT_DIR, "clinical_cases_with_embeddings.jsonl");
  const writer = fs.createWriteStream(filePath, { encoding: "utf8" });
  await new Promise<void>((resolve, reject) => {
    writer.on("error", reject);
    writer.on("finish", resolve);
    for (const row of casesWithEmbeddings) {
      writer.write(`${JSON.stringify(row)}\n`);
    }
    writer.end();
  });

  console.log("Importing clinical_cases with embeddings...");
  runConvexImport("clinical_cases", filePath);

  console.log("\nEmbedding generation and import complete.");
}

generateEmbeddings().catch((error) => {
  console.error("Embedding generation failed:", error);
  process.exitCode = 1;
});
