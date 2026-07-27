# Phase 1: Data Foundation — CSV Ingestion & Convex Queries

**Owner:** Person 1 (Data Engineer)
**Branch:** `phase-1-data` (from `main` after Phase 0 merge)
**Time estimate:** ~3-4 hours
**Depends on:** Phase 0 complete (schema, Convex initialized)

This phase downloads the HuggingFace clinical datasets, parses the CSV.gz files, seeds them into Convex, generates vector embeddings for discharge summaries, and creates all query functions needed by the agents and frontend.

---

## Current Implementation Status (Updated March 7, 2026)

Implemented in `phase-1-data`:
- `scripts/download-data.ts` and `scripts/parse-csv.ts`
- `convex/mutations.ts` with seed + batch mutations and `updateCaseEmbedding`
- `convex/queries.ts` with patient/labs/prescriptions/diagnoses queries
- `convex/actions.ts` with vector search via `ctx.vectorSearch(...)`
- `scripts/seed-convex.ts` for small/reference tables
- `scripts/import-large-tables.ts` for large-table bulk import (hybrid seeding)
- `scripts/generate-embeddings.ts` using Gemini embeddings (not OpenAI)
- `scripts/verify-seed.ts` verification runner
- `data/` added to `.gitignore`
- package scripts added: `data:download`, `data:seed:small`, `data:import:large`, `data:seed`, `data:embed`, `data:verify`

Pending runtime execution (not guaranteed by code-only changes):
- Run full data pipeline against Convex deployment
- Confirm row counts and joins in Convex dashboard
- Confirm embedding coverage and vector search quality
- Confirm verification script passes end-to-end

---

## 1.1 Download the Datasets

Create a `data/` directory and download all 6 CSV.gz files:

```bash
mkdir -p data
```

**File: `scripts/download-data.ts`**

```typescript
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const REPO_ID = "bavehackathon/2026-healthcare-ai";
const BASE_URL = `https://huggingface.co/datasets/${REPO_ID}/resolve/main`;
const DATA_DIR = path.join(process.cwd(), "data");

const FILES = [
  "clinical_cases.csv.gz",
  "labs_subset.csv.gz",
  "lab_dictionary.csv.gz",
  "prescriptions_subset.csv.gz",
  "diagnoses_subset.csv.gz",
  "diagnosis_dictionary.csv.gz",
];

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

for (const file of FILES) {
  const url = `${BASE_URL}/${file}`;
  const dest = path.join(DATA_DIR, file);

  if (fs.existsSync(dest)) {
    console.log(`⏭️  Skipping ${file} (already exists)`);
    continue;
  }

  console.log(`⬇️  Downloading ${file}...`);
  execSync(`curl -L -o "${dest}" "${url}"`, { stdio: "inherit" });
}

console.log("✅ All datasets downloaded to data/");
```

Run it:
```bash
npx tsx scripts/download-data.ts
```

## 1.2 Parse CSV.gz Files

**File: `scripts/parse-csv.ts`**

This utility reads `.csv.gz` files and returns parsed rows.

```typescript
import fs from "fs";
import path from "path";
import zlib from "zlib";
import Papa from "papaparse";

export function parseCsvGz<T = Record<string, unknown>>(
  filename: string
): T[] {
  const filePath = path.join(process.cwd(), "data", filename);
  const gzBuffer = fs.readFileSync(filePath);
  const csvString = zlib.gunzipSync(gzBuffer).toString("utf-8");

  const { data, errors } = Papa.parse<T>(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (errors.length > 0) {
    console.warn(`⚠️  Parse warnings for ${filename}:`, errors.slice(0, 5));
  }

  console.log(`📊 Parsed ${data.length} rows from ${filename}`);
  return data;
}
```

## 1.3 Convex Seed Mutations

Convex mutations run server-side. Create batch insert mutations for each table.

**File: `convex/mutations.ts`**

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── Clinical Cases ──────────────────────────────────────────────
export const seedClinicalCase = mutation({
  args: {
    case_id: v.string(),
    subject_id: v.number(),
    hadm_id: v.number(),
    age: v.number(),
    gender: v.string(),
    admission_diagnosis: v.string(),
    discharge_summary: v.string(),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("clinical_cases", args);
  },
});

// ─── Labs ────────────────────────────────────────────────────────
export const seedLab = mutation({
  args: {
    hadm_id: v.number(),
    itemid: v.number(),
    charttime: v.string(),
    value: v.optional(v.float64()),
    valuestr: v.optional(v.string()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("labs", args);
  },
});

// ─── Batch seed for labs (multiple rows at once) ─────────────────
export const seedLabsBatch = mutation({
  args: {
    labs: v.array(
      v.object({
        hadm_id: v.number(),
        itemid: v.number(),
        charttime: v.string(),
        value: v.optional(v.float64()),
        valuestr: v.optional(v.string()),
        unit: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const lab of args.labs) {
      await ctx.db.insert("labs", lab);
    }
  },
});

// ─── Lab Dictionary ──────────────────────────────────────────────
export const seedLabDictionary = mutation({
  args: {
    itemid: v.number(),
    lab_name: v.string(),
    fluid: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("lab_dictionary", args);
  },
});

// ─── Prescriptions ──────────────────────────────────────────────
export const seedPrescription = mutation({
  args: {
    subject_id: v.number(),
    hadm_id: v.number(),
    drug: v.string(),
    dose_value: v.optional(v.string()),
    dose_unit: v.optional(v.string()),
    route: v.optional(v.string()),
    startdate: v.optional(v.string()),
    enddate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("prescriptions", args);
  },
});

export const seedPrescriptionsBatch = mutation({
  args: {
    prescriptions: v.array(
      v.object({
        subject_id: v.number(),
        hadm_id: v.number(),
        drug: v.string(),
        dose_value: v.optional(v.string()),
        dose_unit: v.optional(v.string()),
        route: v.optional(v.string()),
        startdate: v.optional(v.string()),
        enddate: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const rx of args.prescriptions) {
      await ctx.db.insert("prescriptions", rx);
    }
  },
});

// ─── Diagnoses ──────────────────────────────────────────────────
export const seedDiagnosis = mutation({
  args: {
    subject_id: v.number(),
    hadm_id: v.number(),
    seq_num: v.number(),
    icd9_code: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("diagnoses", args);
  },
});

export const seedDiagnosesBatch = mutation({
  args: {
    diagnoses: v.array(
      v.object({
        subject_id: v.number(),
        hadm_id: v.number(),
        seq_num: v.number(),
        icd9_code: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const dx of args.diagnoses) {
      await ctx.db.insert("diagnoses", dx);
    }
  },
});

// ─── Diagnosis Dictionary ────────────────────────────────────────
export const seedDiagnosisDictionary = mutation({
  args: {
    icd9_code: v.string(),
    short_title: v.string(),
    long_title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("diagnosis_dictionary", args);
  },
});
```

## 1.4 Seed Script (Client-Side Runner)

This script runs from your local machine and calls Convex mutations to insert data.

**File: `scripts/seed-convex.ts`**

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { parseCsvGz } from "./parse-csv";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ─── Types matching CSV columns ──────────────────────────────────
interface ClinicalCase {
  case_id: string;
  subject_id: number;
  hadm_id: number;
  age: number;
  gender: string;
  admission_diagnosis: string;
  discharge_summary: string;
}

interface LabRow {
  hadm_id: number;
  itemid: number;
  charttime: string;
  value: number | null;
  unit: string | null;
}

interface LabDictRow {
  itemid: number;
  lab_name: string;
  fluid: string | null;
  category: string | null;
}

interface PrescriptionRow {
  subject_id: number;
  hadm_id: number;
  drug: string;
  dose_value: string | null;
  dose_unit: string | null;
  route: string | null;
  startdate: string | null;
  enddate: string | null;
}

interface DiagnosisRow {
  subject_id: number;
  hadm_id: number;
  seq_num: number;
  icd9_code: string;
}

interface DiagnosisDictRow {
  icd9_code: string;
  short_title: string;
  long_title: string;
}

// ─── Helper: batch array into chunks ─────────────────────────────
function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function seedAll() {
  console.log("🌱 Starting Convex seed...\n");

  // 1. Clinical Cases (one at a time — ~2000 rows, manageable)
  const cases = parseCsvGz<ClinicalCase>("clinical_cases.csv.gz");
  console.log(`\n📋 Seeding ${cases.length} clinical cases...`);
  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    await client.mutation(api.mutations.seedClinicalCase, {
      case_id: String(c.case_id),
      subject_id: Number(c.subject_id),
      hadm_id: Number(c.hadm_id),
      age: Number(c.age),
      gender: String(c.gender),
      admission_diagnosis: String(c.admission_diagnosis || ""),
      discharge_summary: String(c.discharge_summary || ""),
    });
    if ((i + 1) % 100 === 0) console.log(`  ... ${i + 1}/${cases.length}`);
  }
  console.log(`✅ Clinical cases seeded`);

  // 2. Lab Dictionary (small, one at a time)
  const labDict = parseCsvGz<LabDictRow>("lab_dictionary.csv.gz");
  console.log(`\n🔬 Seeding ${labDict.length} lab dictionary entries...`);
  for (const ld of labDict) {
    await client.mutation(api.mutations.seedLabDictionary, {
      itemid: Number(ld.itemid),
      lab_name: String(ld.lab_name),
      fluid: ld.fluid ? String(ld.fluid) : undefined,
      category: ld.category ? String(ld.category) : undefined,
    });
  }
  console.log(`✅ Lab dictionary seeded`);

  // 3. Labs (large — batch insert)
  const labs = parseCsvGz<LabRow>("labs_subset.csv.gz");
  console.log(`\n🧪 Seeding ${labs.length} lab measurements (batched)...`);
  const labBatches = chunk(labs, 50);
  for (let i = 0; i < labBatches.length; i++) {
    const batch = labBatches[i].map((l) => ({
      hadm_id: Number(l.hadm_id),
      itemid: Number(l.itemid),
      charttime: String(l.charttime),
      value: l.value != null ? Number(l.value) : undefined,
      valuestr: undefined,
      unit: l.unit ? String(l.unit) : undefined,
    }));
    await client.mutation(api.mutations.seedLabsBatch, { labs: batch });
    if ((i + 1) % 100 === 0)
      console.log(`  ... batch ${i + 1}/${labBatches.length}`);
  }
  console.log(`✅ Labs seeded`);

  // 4. Diagnosis Dictionary (small)
  const dxDict = parseCsvGz<DiagnosisDictRow>("diagnosis_dictionary.csv.gz");
  console.log(`\n📖 Seeding ${dxDict.length} diagnosis dictionary entries...`);
  for (const dd of dxDict) {
    await client.mutation(api.mutations.seedDiagnosisDictionary, {
      icd9_code: String(dd.icd9_code),
      short_title: String(dd.short_title),
      long_title: String(dd.long_title),
    });
  }
  console.log(`✅ Diagnosis dictionary seeded`);

  // 5. Diagnoses (batch)
  const diagnoses = parseCsvGz<DiagnosisRow>("diagnoses_subset.csv.gz");
  console.log(`\n🏥 Seeding ${diagnoses.length} diagnoses (batched)...`);
  const dxBatches = chunk(diagnoses, 50);
  for (let i = 0; i < dxBatches.length; i++) {
    const batch = dxBatches[i].map((d) => ({
      subject_id: Number(d.subject_id),
      hadm_id: Number(d.hadm_id),
      seq_num: Number(d.seq_num),
      icd9_code: String(d.icd9_code),
    }));
    await client.mutation(api.mutations.seedDiagnosesBatch, {
      diagnoses: batch,
    });
    if ((i + 1) % 100 === 0)
      console.log(`  ... batch ${i + 1}/${dxBatches.length}`);
  }
  console.log(`✅ Diagnoses seeded`);

  // 6. Prescriptions (batch)
  const rxs = parseCsvGz<PrescriptionRow>("prescriptions_subset.csv.gz");
  console.log(`\n💊 Seeding ${rxs.length} prescriptions (batched)...`);
  const rxBatches = chunk(rxs, 50);
  for (let i = 0; i < rxBatches.length; i++) {
    const batch = rxBatches[i].map((r) => ({
      subject_id: Number(r.subject_id),
      hadm_id: Number(r.hadm_id),
      drug: String(r.drug),
      dose_value: r.dose_value != null ? String(r.dose_value) : undefined,
      dose_unit: r.dose_unit ? String(r.dose_unit) : undefined,
      route: r.route ? String(r.route) : undefined,
      startdate: r.startdate ? String(r.startdate) : undefined,
      enddate: r.enddate ? String(r.enddate) : undefined,
    }));
    await client.mutation(api.mutations.seedPrescriptionsBatch, {
      prescriptions: batch,
    });
    if ((i + 1) % 100 === 0)
      console.log(`  ... batch ${i + 1}/${rxBatches.length}`);
  }
  console.log(`✅ Prescriptions seeded`);

  console.log("\n🎉 All data seeded successfully!");
}

seedAll().catch(console.error);
```

Run the seed:
```bash
# Hybrid pipeline currently implemented in this branch
pnpm run data:seed:small
pnpm run data:import:large
# or
pnpm run data:seed
```

> **Branch update:** large tables (`labs`, `prescriptions`, `diagnoses`) are imported with `convex import` for higher throughput. `scripts/seed-convex.ts` is now for small/reference tables.

> **Note:** This may take 10-20 minutes depending on dataset size and Convex rate limits. The batch mutations help, but ~2000 cases × multiple related tables = many mutations. Run it and let it cook.

## 1.5 Generate Embeddings for Discharge Summaries

After clinical cases are seeded, generate embeddings and update the records.

> **Branch update:** implementation now uses Gemini embeddings (`gemini-embedding-001`) with `GEMINI_EMBEDDING_DIMENSIONS=1536` to match the Convex vector index.

**File: `convex/mutations.ts`** (append to existing file)

```typescript
// ─── Update embedding for a clinical case ────────────────────────
export const updateCaseEmbedding = mutation({
  args: {
    hadm_id: v.number(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const cases = await ctx.db
      .query("clinical_cases")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    if (cases.length > 0) {
      await ctx.db.patch(cases[0]._id, { embedding: args.embedding });
    }
  },
});
```

**File: `scripts/generate-embeddings.ts`**

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { parseCsvGz } from "./parse-csv";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

interface ClinicalCase {
  hadm_id: number;
  discharge_summary: string;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function generateEmbeddings() {
  const cases = parseCsvGz<ClinicalCase>("clinical_cases.csv.gz");
  console.log(`🧠 Generating embeddings for ${cases.length} discharge summaries...\n`);

  // Process in batches of 20 (OpenAI embedding API supports batching)
  const batches = chunk(cases, 20);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const texts = batch.map((c) =>
      (c.discharge_summary || "").slice(0, 8000) // Truncate to ~8k chars
    );

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    for (let j = 0; j < batch.length; j++) {
      const embedding = response.data[j].embedding;
      await client.mutation(api.mutations.updateCaseEmbedding, {
        hadm_id: Number(batch[j].hadm_id),
        embedding,
      });
    }

    console.log(`  ✅ Batch ${i + 1}/${batches.length} (${batch.length} embeddings)`);

    // Rate limit: small delay between batches
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n🎉 All embeddings generated and stored!");
}

generateEmbeddings().catch(console.error);
```

Run it (after seed is complete):
```bash
npx tsx scripts/generate-embeddings.ts
```

> **Cost note:** `text-embedding-3-small` costs ~$0.02 per 1M tokens. ~2000 discharge summaries ≈ very cheap, likely < $0.10.

## 1.6 Convex Query Functions

These are the read-only functions that agents and frontend will use.

**File: `convex/queries.ts`**

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

// ─── Patient List (paginated) ────────────────────────────────────
export const getPatientList = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const results = await ctx.db
      .query("clinical_cases")
      .order("asc")
      .take(limit);

    return results.map((c) => ({
      _id: c._id,
      case_id: c.case_id,
      subject_id: c.subject_id,
      hadm_id: c.hadm_id,
      age: c.age,
      gender: c.gender,
      admission_diagnosis: c.admission_diagnosis,
      // Exclude discharge_summary for list view (too large)
    }));
  },
});

// ─── Single Patient by hadm_id ───────────────────────────────────
export const getPatientById = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const cases = await ctx.db
      .query("clinical_cases")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();
    return cases[0] ?? null;
  },
});

// ─── Labs by Admission (joined with dictionary) ──────────────────
export const getLabsByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    // Join with lab dictionary for names
    const enriched = await Promise.all(
      labs.map(async (lab) => {
        const dict = await ctx.db
          .query("lab_dictionary")
          .withIndex("by_itemid", (q) => q.eq("itemid", lab.itemid))
          .first();
        return {
          ...lab,
          lab_name: dict?.lab_name ?? `Unknown (${lab.itemid})`,
          fluid: dict?.fluid ?? null,
          category: dict?.category ?? null,
        };
      })
    );

    return enriched;
  },
});

// ─── Labs by Admission + specific lab type ───────────────────────
export const getLabTrend = query({
  args: {
    hadm_id: v.number(),
    itemid: v.number(),
  },
  handler: async (ctx, args) => {
    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id_itemid", (q) =>
        q.eq("hadm_id", args.hadm_id).eq("itemid", args.itemid)
      )
      .collect();

    const dict = await ctx.db
      .query("lab_dictionary")
      .withIndex("by_itemid", (q) => q.eq("itemid", args.itemid))
      .first();

    return {
      lab_name: dict?.lab_name ?? `Unknown (${args.itemid})`,
      fluid: dict?.fluid ?? null,
      category: dict?.category ?? null,
      data: labs
        .sort(
          (a, b) =>
            new Date(a.charttime).getTime() - new Date(b.charttime).getTime()
        )
        .map((l) => ({
          charttime: l.charttime,
          value: l.value,
          unit: l.unit,
        })),
    };
  },
});

// ─── Unique Lab Types for an Admission ───────────────────────────
export const getLabTypesForAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    const uniqueItemIds = [...new Set(labs.map((l) => l.itemid))];

    const labTypes = await Promise.all(
      uniqueItemIds.map(async (itemid) => {
        const dict = await ctx.db
          .query("lab_dictionary")
          .withIndex("by_itemid", (q) => q.eq("itemid", itemid))
          .first();
        return {
          itemid,
          lab_name: dict?.lab_name ?? `Unknown (${itemid})`,
          category: dict?.category ?? null,
          count: labs.filter((l) => l.itemid === itemid).length,
        };
      })
    );

    return labTypes.sort((a, b) => b.count - a.count);
  },
});

// ─── Prescriptions by Admission ──────────────────────────────────
export const getPrescriptionsByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prescriptions")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();
  },
});

// ─── Diagnoses by Admission (joined with dictionary) ─────────────
export const getDiagnosesByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const diagnoses = await ctx.db
      .query("diagnoses")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    const enriched = await Promise.all(
      diagnoses.map(async (dx) => {
        const dict = await ctx.db
          .query("diagnosis_dictionary")
          .withIndex("by_icd9_code", (q) => q.eq("icd9_code", dx.icd9_code))
          .first();
        return {
          ...dx,
          short_title: dict?.short_title ?? "Unknown",
          long_title: dict?.long_title ?? "Unknown",
        };
      })
    );

    return enriched.sort((a, b) => a.seq_num - b.seq_num);
  },
});

// ─── Vector Search on Discharge Summaries ────────────────────────
export const searchDischargeSummaries = query({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("clinical_cases")
      .withSearchIndex("by_embedding", {
        vector: args.embedding,
        limit: args.limit ?? 5,
      });

    // Note: Convex vector search uses .withSearchIndex for vector queries
    // The actual API may differ slightly — check Convex docs for vectorSearch
    // Alternative approach using action:
    return results;
  },
});
```

> **Branch update:** this branch implements vector search in `convex/actions.ts` using `ctx.vectorSearch(...)`.

**File: `convex/actions.ts`**

```typescript
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const searchDischargeSummaries = action({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("clinical_cases", "by_embedding", {
      vector: args.embedding,
      limit: args.limit ?? 5,
    });

    // Fetch the full documents for the results
    const docs = await Promise.all(
      results.map(async (result) => {
        const doc = await ctx.runQuery(
          // Use an internal query to fetch by ID
          "queries:getPatientByDocId" as any,
          { id: result._id }
        );
        return { ...doc, score: result._score };
      })
    );

    return docs;
  },
});
```

## 1.7 Verification Checklist

After seeding completes, verify data integrity by running these checks in the Convex dashboard (`npx convex dashboard`):

| Check | Query | Expected |
|---|---|---|
| Case count | `clinical_cases` table row count | ~2000 |
| Lab count | `labs` table row count | Thousands |
| Dictionary completeness | `lab_dictionary` row count | All lab types |
| Diagnosis dict | `diagnosis_dictionary` row count | ICD-9 codes |
| Embedding coverage | Cases with non-null `embedding` | ~2000 |
| Join integrity | Query labs for a known `hadm_id` | Returns enriched rows with lab names |
| Vector search | Search with a test embedding | Returns ranked results |

**Quick test script:** `scripts/verify-seed.ts`

> **Branch update:** current `getPatientList` returns `{ items, nextCursor }`, and `scripts/verify-seed.ts` already handles this shape.

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function verify() {
  // 1. Get patient list
  const patients = await client.query(api.queries.getPatientList, { limit: 5 });
  console.log(`📋 Patients (first 5):`, patients.map((p) => `${p.hadm_id} - ${p.admission_diagnosis}`));

  if (patients.length === 0) {
    console.error("❌ No patients found! Seed may have failed.");
    return;
  }

  const testHadmId = patients[0].hadm_id;
  console.log(`\n🔍 Testing with hadm_id: ${testHadmId}\n`);

  // 2. Get full patient
  const patient = await client.query(api.queries.getPatientById, { hadm_id: testHadmId });
  console.log(`👤 Patient:`, { age: patient?.age, gender: patient?.gender, diagnosis: patient?.admission_diagnosis });
  console.log(`📝 Summary length:`, patient?.discharge_summary?.length, "chars");
  console.log(`🧠 Has embedding:`, !!patient?.embedding);

  // 3. Get labs
  const labs = await client.query(api.queries.getLabsByAdmission, { hadm_id: testHadmId });
  console.log(`\n🧪 Labs: ${labs.length} measurements`);
  if (labs.length > 0) {
    console.log(`   First lab: ${labs[0].lab_name} = ${labs[0].value} ${labs[0].unit}`);
  }

  // 4. Get prescriptions
  const rxs = await client.query(api.queries.getPrescriptionsByAdmission, { hadm_id: testHadmId });
  console.log(`\n💊 Prescriptions: ${rxs.length} medications`);
  if (rxs.length > 0) {
    console.log(`   First: ${rxs[0].drug} ${rxs[0].dose_value} ${rxs[0].dose_unit}`);
  }

  // 5. Get diagnoses
  const dxs = await client.query(api.queries.getDiagnosesByAdmission, { hadm_id: testHadmId });
  console.log(`\n🏥 Diagnoses: ${dxs.length} codes`);
  if (dxs.length > 0) {
    console.log(`   Primary: [${dxs[0].icd9_code}] ${dxs[0].short_title}`);
  }

  console.log("\n✅ Verification complete!");
}

verify().catch(console.error);
```

Run:
```bash
npx tsx scripts/verify-seed.ts
```

---

## PR Checklist � Phase 1

Completed in branch:
- [x] `scripts/download-data.ts` � downloads all datasets
- [x] `scripts/parse-csv.ts` � CSV.gz parser utility
- [x] `scripts/seed-convex.ts` � seeds small/reference tables
- [x] `scripts/import-large-tables.ts` � imports large tables via `convex import`
- [x] `scripts/generate-embeddings.ts` � generates + stores embeddings (Gemini)
- [x] `scripts/verify-seed.ts` � verification script implemented
- [x] `convex/mutations.ts` � seed mutations + batch variants + embedding update
- [x] `convex/queries.ts` � patient/lab/prescription/diagnosis query functions
- [x] `convex/actions.ts` � vector search action
- [x] `data/` added to `.gitignore` (don't commit raw CSVs)

Pending runtime validation:
- [ ] `data/` directory contains all 6 downloaded CSV.gz files locally
- [ ] `pnpm run data:seed` executed successfully against active Convex deployment
- [ ] `pnpm run data:embed` executed successfully with Gemini API key configured
- [ ] `pnpm run data:verify` passes end-to-end
- [ ] Convex dashboard shows all tables populated with expected row counts
- [ ] Vector index `by_embedding` populated and vector search returns ranked results

## Troubleshooting

| Issue | Solution |
|---|---|
| Convex rate limiting | Reduce batch size from 50 to 20, add delays |
| CSV parse errors | Check `dynamicTyping: true` handling — some fields may need explicit casting |
| Embedding API errors | Check Gemini API key, model name, and embedding dimensions (1536) in .env.local |
| `null` lab values | Some lab values are text (e.g., ">1000") — store in `valuestr` field |
| Convex 1MB document limit | Truncate very long discharge summaries before seeding |


