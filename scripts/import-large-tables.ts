import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { loadEnvLocal } from "./load-env";
import { parseCsvGz } from "./parse-csv";

loadEnvLocal();

type GenericRow = Record<string, unknown>;

interface LabRow extends GenericRow {
  hadm_id: unknown;
  itemid: unknown;
  charttime: unknown;
  value?: unknown;
  valuestr?: unknown;
  unit?: unknown;
}

interface PrescriptionRow extends GenericRow {
  subject_id: unknown;
  hadm_id: unknown;
  drug: unknown;
  dose_value?: unknown;
  dose_unit?: unknown;
  route?: unknown;
  startdate?: unknown;
  enddate?: unknown;
}

interface DiagnosisRow extends GenericRow {
  subject_id: unknown;
  hadm_id: unknown;
  seq_num: unknown;
  icd9_code: unknown;
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

function toOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : undefined;
}

function normalizeLabValue(row: LabRow): { value?: number; valuestr?: string } {
  const numeric = toNumber(row.value);
  if (numeric !== null) {
    return { value: numeric };
  }

  const fallbackValue = toOptionalString(row.valuestr) ?? toOptionalString(row.value);
  if (fallbackValue) {
    return { valuestr: fallbackValue };
  }

  return {};
}

function ensureImportDir(): void {
  fs.mkdirSync(IMPORT_DIR, { recursive: true });
}

async function writeJsonLines<T extends object>(
  filename: string,
  rows: T[],
): Promise<string> {
  const filePath = path.join(IMPORT_DIR, filename);
  const writer = fs.createWriteStream(filePath, { encoding: "utf8" });

  await new Promise<void>((resolve, reject) => {
    writer.on("error", reject);
    writer.on("finish", () => resolve());

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

async function buildLabsImport(): Promise<string> {
  const sourceRows = parseCsvGz<LabRow>("labs_subset.csv.gz");
  const rows = sourceRows
    .map((row) => {
      const hadmId = toNumber(row.hadm_id);
      const itemId = toNumber(row.itemid);
      const charttime = toOptionalString(row.charttime);

      if (hadmId === null || itemId === null || !charttime) {
        return null;
      }

      return {
        hadm_id: hadmId,
        itemid: itemId,
        charttime,
        ...normalizeLabValue(row),
        unit: toOptionalString(row.unit),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  console.log(`Prepared ${rows.length} labs for import.`);
  return await writeJsonLines("labs.jsonl", rows);
}

async function buildPrescriptionsImport(): Promise<string> {
  const sourceRows = parseCsvGz<PrescriptionRow>("prescriptions_subset.csv.gz");
  const rows = sourceRows
    .map((row) => {
      const subjectId = toNumber(row.subject_id);
      const hadmId = toNumber(row.hadm_id);
      const drug = toOptionalString(row.drug);

      if (subjectId === null || hadmId === null || !drug) {
        return null;
      }

      return {
        subject_id: subjectId,
        hadm_id: hadmId,
        drug,
        dose_value: toOptionalString(row.dose_value),
        dose_unit: toOptionalString(row.dose_unit),
        route: toOptionalString(row.route),
        startdate: toOptionalString(row.startdate),
        enddate: toOptionalString(row.enddate),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  console.log(`Prepared ${rows.length} prescriptions for import.`);
  return await writeJsonLines("prescriptions.jsonl", rows);
}

async function buildDiagnosesImport(): Promise<string> {
  const sourceRows = parseCsvGz<DiagnosisRow>("diagnoses_subset.csv.gz");
  const rows = sourceRows
    .map((row) => {
      const subjectId = toNumber(row.subject_id);
      const hadmId = toNumber(row.hadm_id);
      const seqNum = toNumber(row.seq_num);
      const icd9Code = toOptionalString(row.icd9_code);

      if (
        subjectId === null ||
        hadmId === null ||
        seqNum === null ||
        !icd9Code
      ) {
        return null;
      }

      return {
        subject_id: subjectId,
        hadm_id: hadmId,
        seq_num: seqNum,
        icd9_code: icd9Code,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  console.log(`Prepared ${rows.length} diagnoses for import.`);
  return await writeJsonLines("diagnoses.jsonl", rows);
}

async function importLargeTables(): Promise<void> {
  ensureImportDir();

  console.log("Building import files for large tables...");
  const labsFile = await buildLabsImport();
  const prescriptionsFile = await buildPrescriptionsImport();
  const diagnosesFile = await buildDiagnosesImport();

  console.log("Importing labs...");
  runConvexImport("labs", labsFile);

  console.log("Importing prescriptions...");
  runConvexImport("prescriptions", prescriptionsFile);

  console.log("Importing diagnoses...");
  runConvexImport("diagnoses", diagnosesFile);

  console.log("Large table import complete.");
}

importLargeTables().catch((error) => {
  console.error("Large table import failed:", error);
  process.exitCode = 1;
});
