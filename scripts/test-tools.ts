/**
 * Test script for Mastra tools.
 * Run with: npx tsx scripts/test-tools.ts
 *
 * Requires:
 *   - NEXT_PUBLIC_CONVEX_URL in .env.local
 *   - TAVILY_API_KEY in .env.local
 *   - Convex dev server running (npx convex dev)
 *   - Data seeded (Phase 1)
 */

import dotenv from "dotenv";
import { ConvexHttpClient } from "convex/browser";

dotenv.config({ path: ".env.local" });

// We test by calling Convex directly rather than through Mastra tool wrappers,
// since tool.execute() is designed to be invoked by agents at runtime.

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("NEXT_PUBLIC_CONVEX_URL not set in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function testTools() {
  const TEST_HADM_ID = 100006;

  console.log("--- Testing Convex Queries (backing Phase 2 tools) ---\n");

  console.log("[1] Patient Query...");
  try {
    // Dynamic import for generated API types
    const { api } = await import("../convex/_generated/api");
    const patient = await client.query(api.queries.getPatientById, {
      hadm_id: TEST_HADM_ID,
    });
    if (patient) {
      console.log(
        `  OK: ${patient.case_id} | age=${patient.age} | gender=${patient.gender}`
      );
      console.log(`  Diagnosis: ${patient.admission_diagnosis}`);
    } else {
      console.log(`  No patient found for hadm_id ${TEST_HADM_ID}`);
    }
  } catch (e) {
    console.error("  FAIL:", e);
  }

  console.log("\n[2] Lab Types...");
  try {
    const { api } = await import("../convex/_generated/api");
    const labTypes = await client.query(api.queries.getLabTypesForAdmission, {
      hadm_id: TEST_HADM_ID,
    });
    console.log(`  OK: ${labTypes.length} lab types found`);
    if (labTypes.length > 0) {
      const top = labTypes[0];
      console.log(
        `  Top lab: ${top.lab_name} (${top.count} measurements)`
      );

      console.log("\n[3] Lab Trend...");
      const trend = await client.query(api.queries.getLabTrend, {
        hadm_id: TEST_HADM_ID,
        itemid: top.itemid,
      });
      console.log(
        `  OK: ${trend.lab_name} — ${trend.data.length} data points`
      );
    }
  } catch (e) {
    console.error("  FAIL:", e);
  }

  console.log("\n[4] Prescriptions...");
  try {
    const { api } = await import("../convex/_generated/api");
    const rxs = await client.query(api.queries.getPrescriptionsByAdmission, {
      hadm_id: TEST_HADM_ID,
    });
    console.log(`  OK: ${rxs.length} prescriptions`);
    if (rxs.length > 0) {
      console.log(`  First: ${rxs[0].drug}`);
    }
  } catch (e) {
    console.error("  FAIL:", e);
  }

  console.log("\n[5] Diagnoses...");
  try {
    const { api } = await import("../convex/_generated/api");
    const dxs = await client.query(api.queries.getDiagnosesByAdmission, {
      hadm_id: TEST_HADM_ID,
    });
    console.log(`  OK: ${dxs.length} diagnoses`);
    if (dxs.length > 0) {
      console.log(
        `  Primary: [${dxs[0].icd9_code}] ${dxs[0].short_title}`
      );
    }
  } catch (e) {
    console.error("  FAIL:", e);
  }

  console.log("\n[6] Tavily Research (requires TAVILY_API_KEY)...");
  try {
    const { tavily } = await import("@tavily/core");
    const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY! });
    const response = await tavilyClient.search(
      "treatment guidelines congestive heart failure 2026",
      { searchDepth: "basic", maxResults: 3, includeAnswer: true }
    );
    console.log(`  OK: ${response.results.length} results`);
    if (response.answer) {
      console.log(`  Answer: ${response.answer.slice(0, 150)}...`);
    }
  } catch (e) {
    console.error("  FAIL:", e);
  }

  console.log("\n--- Tool testing complete ---");
}

testTools().catch(console.error);
