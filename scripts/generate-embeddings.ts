import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import OpenAI from "openai";
import { parseCsvGz } from "./parse-csv";
import { loadEnvLocal } from "./load-env";

loadEnvLocal();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  // ~1800 tokens/case avg; OpenAI limit is 300K tokens/request → ~150 cases/batch safely
  const BATCH_SIZE = 100;
  const batches: typeof cases[] = [];
  for (let i = 0; i < cases.length; i += BATCH_SIZE) {
    batches.push(cases.slice(i, i + BATCH_SIZE));
  }

  console.log(`Generating OpenAI embeddings for ${cases.length} cases in ${batches.length} batches...`);

  const allEmbeddings: number[][] = [];
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const texts = batch.map((c) => c.discharge_summary.slice(0, 8000));
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    for (const item of response.data) {
      allEmbeddings.push(item.embedding);
    }
    console.log(`  batch ${i + 1}/${batches.length}`);
  }

  console.log(`Got ${allEmbeddings.length} embeddings. Writing JSONL...`);

  const casesWithEmbeddings = cases.map((c, i) => ({
    ...c,
    embedding: allEmbeddings[i],
  }));

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

  console.log("Importing clinical_cases with embeddings into Convex...");
  runConvexImport("clinical_cases", filePath);

  console.log("\nDone! All 2000 cases embedded and imported.");
}

generateEmbeddings().catch((error) => {
  console.error("Embedding generation failed:", error);
  process.exitCode = 1;
});
