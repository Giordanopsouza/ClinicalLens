import { ConvexHttpClient } from "convex/browser";

import { api } from "../convex/_generated/api";
import { loadEnvLocal } from "./load-env";
import { parseCsvGz } from "./parse-csv";

loadEnvLocal();

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is required in .env.local");
}

const client = new ConvexHttpClient(convexUrl);

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

async function seedClinicalCases(): Promise<void> {
  const rows = parseCsvGz<ClinicalCaseRow>("clinical_cases.csv.gz");
  console.log(`Seeding ${rows.length} clinical cases...`);

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const subjectId = toNumber(row.subject_id);
    const hadmId = toNumber(row.hadm_id);
    const age = toNumber(row.age);

    if (subjectId === null || hadmId === null || age === null) {
      continue;
    }

    await client.mutation(api.mutations.seedClinicalCase, {
      case_id: toStringValue(row.case_id),
      subject_id: subjectId,
      hadm_id: hadmId,
      age,
      gender: toStringValue(row.gender),
      admission_diagnosis: toStringValue(row.admission_diagnosis),
      discharge_summary: toStringValue(row.discharge_summary),
    });

    if ((index + 1) % 100 === 0) {
      console.log(`  ${index + 1}/${rows.length}`);
    }
  }
}

async function seedLabDictionary(): Promise<void> {
  const rows = parseCsvGz<LabDictionaryRow>("lab_dictionary.csv.gz");
  console.log(`Seeding ${rows.length} lab dictionary rows...`);

  for (const row of rows) {
    const itemId = toNumber(row.itemid);
    if (itemId === null) {
      continue;
    }

    await client.mutation(api.mutations.seedLabDictionary, {
      itemid: itemId,
      lab_name: toStringValue(row.lab_name),
      fluid: toOptionalString(row.fluid),
      category: toOptionalString(row.category),
    });
  }
}

async function seedDiagnosisDictionary(): Promise<void> {
  const rows = parseCsvGz<DiagnosisDictionaryRow>("diagnosis_dictionary.csv.gz");
  console.log(`Seeding ${rows.length} diagnosis dictionary rows...`);

  for (const row of rows) {
    await client.mutation(api.mutations.seedDiagnosisDictionary, {
      icd9_code: toStringValue(row.icd9_code),
      short_title: toStringValue(row.short_title),
      long_title: toStringValue(row.long_title),
    });
  }
}

async function seedAll(): Promise<void> {
  console.log("Starting small/reference table seed...");
  await seedClinicalCases();
  await seedLabDictionary();
  await seedDiagnosisDictionary();
  console.log("Small/reference seed complete.");
}

seedAll().catch((error) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});
