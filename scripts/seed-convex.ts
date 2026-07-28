import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { loadEnvLocal } from "./load-env";
import { parseCsvGz } from "./parse-csv";

loadEnvLocal();

type GenericRow = Record<string, unknown>;

interface ClinicalCaseRow extends GenericRow {
  case_id: unknown;
  subject_id: unknown;
  hadm_id: unknown;
  age: unknown;
  gender: unknown;
  admission_diagnosis: unknown;
  discharge_summary: unknown;
}

interface LabDictionaryRow extends GenericRow {
  itemid: unknown;
  lab_name: unknown;
  fluid?: unknown;
  category?: unknown;
}

interface DiagnosisDictionaryRow extends GenericRow {
  icd9_code: unknown;
  short_title: unknown;
  long_title: unknown;
}

const IMPORT_DIR = path.join(process.cwd(), "data", "_convex_import");

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

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function toOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : undefined;
}

function ensureImportDir(): void {
  fs.mkdirSync(IMPORT_DIR, { recursive: true });
}

async function writeJsonLines<T extends object>(filename: string, rows: T[]): Promise<string> {
  const filePath = path.join(IMPORT_DIR, filename);
  const writer = fs.createWriteStream(filePath, { encoding: "utf8" });
  await new Promise<void>((resolve, reject) => {
    writer.on("error", reject);
    writer.on("finish", resolve);
    for (const row of rows) {
      writer.write(`${JSON.stringify(row)}\n`);
    }
    writer.end();
  });
  return filePath;
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

async function buildClinicalCasesImport(): Promise<string> {
  const sourceRows = parseCsvGz<ClinicalCaseRow>("clinical_cases.csv.gz");
  const rows = sourceRows
    .map((row) => {
      const subjectId = toNumber(row.subject_id);
      const hadmId = toNumber(row.hadm_id);
      const age = toNumber(row.age);
      if (subjectId === null || hadmId === null || age === null) {
        return null;
      }
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

  console.log(`Prepared ${rows.length} clinical cases for import.`);
  return await writeJsonLines("clinical_cases.jsonl", rows);
}

async function buildLabDictionaryImport(): Promise<string> {
  const sourceRows = parseCsvGz<LabDictionaryRow>("lab_dictionary.csv.gz");
  const rows = sourceRows
    .map((row) => {
      const itemId = toNumber(row.itemid);
      if (itemId === null) {
        return null;
      }
      return {
        itemid: itemId,
        lab_name: toStringValue(row.lab_name),
        fluid: toOptionalString(row.fluid),
        category: toOptionalString(row.category),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  console.log(`Prepared ${rows.length} lab dictionary rows for import.`);
  return await writeJsonLines("lab_dictionary.jsonl", rows);
}

async function buildDiagnosisDictionaryImport(): Promise<string> {
  const sourceRows = parseCsvGz<DiagnosisDictionaryRow>("diagnosis_dictionary.csv.gz");
  const rows = sourceRows.map((row) => ({
    icd9_code: toStringValue(row.icd9_code),
    short_title: toStringValue(row.short_title),
    long_title: toStringValue(row.long_title),
  }));

  console.log(`Prepared ${rows.length} diagnosis dictionary rows for import.`);
  return await writeJsonLines("diagnosis_dictionary.jsonl", rows);
}

async function seedAll(): Promise<void> {
  ensureImportDir();
  console.log("Starting small/reference table seed (via convex import)...\n");

  const casesFile = await buildClinicalCasesImport();
  const labDictFile = await buildLabDictionaryImport();
  const diagDictFile = await buildDiagnosisDictionaryImport();

  console.log("\nImporting clinical_cases...");
  runConvexImport("clinical_cases", casesFile);

  console.log("Importing lab_dictionary...");
  runConvexImport("lab_dictionary", labDictFile);

  console.log("Importing diagnosis_dictionary...");
  runConvexImport("diagnosis_dictionary", diagDictFile);

  console.log("\nSmall/reference seed complete.");
}

seedAll().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
