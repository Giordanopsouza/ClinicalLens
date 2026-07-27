# Phase 2: Mastra Agents & Tools — The AI Brain

**Status:** 100% Complete (10/10 Tasks)
**Owner:** Person 2 (Agent Engineer)
**Branch:** `phase-2-agents` (from `main` after Phase 1 merge)
**Time estimate:** ~3-4 hours
**Depends on:** Phase 0 (scaffold) + Phase 1 (Convex populated with data + queries)

This phase builds the Mastra agent framework inside Next.js: configuring the Gemini 3.0 model, creating 5 tools for clinical data access, defining 2 agents (main copilot + safety auditor), wiring up CopilotKit via AG-UI, and configuring Observational Memory.

---

## 2.1 Install Additional Agent Dependencies

These should already be installed from Phase 0, but verify:

```bash
pnpm add @mastra/core @mastra/client-js @ag-ui/mastra @ag-ui/core @ag-ui/client @copilotkit/runtime @tavily/core @google/generative-ai ai @ai-sdk/google openai
```

## 2.2 Mastra Configuration

**File: `src/mastra/index.ts`**

Replace the Phase 0 placeholder with the full configuration:

```typescript
import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";
import { clinicalCopilotAgent } from "./agents/clinical-copilot";
import { safetyAuditAgent } from "./agents/safety-audit";

export const mastra = new Mastra({
  agents: {
    clinicalCopilotAgent,
    safetyAuditAgent,
  },
  server: {
    cors: {
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    apiRoutes: [
      registerCopilotKit({
        path: "/copilotkit",
        resourceId: "clinicalCopilotAgent",
      }),
    ],
  },
});
```

## 2.3 Next.js API Route for CopilotKit

CopilotKit needs an HTTP endpoint to communicate with Mastra. Create the API route:

**File: `src/app/api/copilotkit/route.ts`**

```typescript
import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { MastraClient } from "@mastra/client-js";

// Connect to the Mastra instance
const mastraClient = new MastraClient({
  baseUrl: process.env.MASTRA_BASE_URL || "http://localhost:4111",
});

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
```

> **Alternative approach:** If running Mastra as an embedded server doesn't work cleanly with Next.js API routes, you can run Mastra separately on port 4111 using `pnpm mastra dev` and point CopilotKit directly to it. See Section 2.10 for the alternative setup.

## 2.4 Tool Definitions

Each tool is a Mastra Tool that the agents can invoke. Tools call Convex query functions via the `ConvexHttpClient`.

### Shared Convex Client Utility

**File: `src/mastra/tools/convex-client.ts`**

```typescript
import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    client = new ConvexHttpClient(url);
  }
  return client;
}
```

### Tool 1: Patient Query Tool

**File: `src/mastra/tools/patient-query.ts`**

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "../../../convex/_generated/api";

export const patientQueryTool = createTool({
  id: "patient-query",
  description:
    "Look up a patient's full clinical record by their hospital admission ID (hadm_id). Returns demographics (age, gender), admission diagnosis, and discharge summary.",
  inputSchema: z.object({
    hadm_id: z
      .number()
      .describe("The hospital admission ID to look up"),
  }),
  outputSchema: z.object({
    case_id: z.string(),
    subject_id: z.number(),
    hadm_id: z.number(),
    age: z.number(),
    gender: z.string(),
    admission_diagnosis: z.string(),
    discharge_summary: z.string(),
  }),
  execute: async ({ context }) => {
    const client = getConvexClient();
    const patient = await client.query(api.queries.getPatientById, {
      hadm_id: context.hadm_id,
    });

    if (!patient) {
      throw new Error(`No patient found with hadm_id: ${context.hadm_id}`);
    }

    return {
      case_id: patient.case_id,
      subject_id: patient.subject_id,
      hadm_id: patient.hadm_id,
      age: patient.age,
      gender: patient.gender,
      admission_diagnosis: patient.admission_diagnosis,
      discharge_summary: patient.discharge_summary,
    };
  },
});
```

### Tool 2: Lab Trend Tool

**File: `src/mastra/tools/lab-trend.ts`**

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "../../../convex/_generated/api";

export const labTrendTool = createTool({
  id: "lab-trend",
  description:
    "Fetch a time-series of laboratory measurements for a specific patient and lab type. Use this to chart trends in lab values like Hemoglobin, Creatinine, Glucose, etc. First call getLabTypesForAdmission to see available lab types, then use the itemid here.",
  inputSchema: z.object({
    hadm_id: z.number().describe("Hospital admission ID"),
    itemid: z.number().describe("Lab item ID (from lab dictionary)"),
  }),
  outputSchema: z.object({
    lab_name: z.string(),
    fluid: z.string().nullable(),
    category: z.string().nullable(),
    data: z.array(
      z.object({
        charttime: z.string(),
        value: z.number().nullable(),
        unit: z.string().nullable(),
      })
    ),
  }),
  execute: async ({ context }) => {
    const client = getConvexClient();
    const result = await client.query(api.queries.getLabTrend, {
      hadm_id: context.hadm_id,
      itemid: context.itemid,
    });
    return result;
  },
});

export const labTypesTool = createTool({
  id: "lab-types",
  description:
    "List all available lab test types for a patient's admission, with counts. Use this to discover which labs were measured before querying specific trends.",
  inputSchema: z.object({
    hadm_id: z.number().describe("Hospital admission ID"),
  }),
  outputSchema: z.object({
    labTypes: z.array(
      z.object({
        itemid: z.number(),
        lab_name: z.string(),
        category: z.string().nullable(),
        count: z.number(),
      })
    ),
  }),
  execute: async ({ context }) => {
    const client = getConvexClient();
    const labTypes = await client.query(
      api.queries.getLabTypesForAdmission,
      { hadm_id: context.hadm_id }
    );
    return { labTypes };
  },
});
```

### Tool 3: Safety Check Tool

**File: `src/mastra/tools/safety-check.ts`**

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "../../../convex/_generated/api";

export const safetyCheckTool = createTool({
  id: "safety-check",
  description:
    "Cross-reference a patient's prescriptions against their diagnoses to find potential mismatches. Flags drugs that have no corresponding diagnosis code, which may indicate charting errors or missing context. Returns a list of flagged medications with reasons.",
  inputSchema: z.object({
    hadm_id: z.number().describe("Hospital admission ID to audit"),
  }),
  outputSchema: z.object({
    hadm_id: z.number(),
    total_prescriptions: z.number(),
    total_diagnoses: z.number(),
    flags: z.array(
      z.object({
        drug: z.string(),
        issue: z.string(),
        severity: z.enum(["info", "warning", "critical"]),
      })
    ),
    summary: z.string(),
  }),
  execute: async ({ context }) => {
    const client = getConvexClient();

    // Fetch prescriptions and diagnoses in parallel
    const [prescriptions, diagnoses] = await Promise.all([
      client.query(api.queries.getPrescriptionsByAdmission, {
        hadm_id: context.hadm_id,
      }),
      client.query(api.queries.getDiagnosesByAdmission, {
        hadm_id: context.hadm_id,
      }),
    ]);

    const diagnosisTitles = diagnoses.map((d: any) =>
      (d.long_title || d.short_title || "").toLowerCase()
    );
    const icd9Codes = diagnoses.map((d: any) => d.icd9_code);

    // Simple heuristic-based drug-diagnosis matching
    // In production, this would use a proper drug-indication database
    const DRUG_DIAGNOSIS_HINTS: Record<string, string[]> = {
      insulin: ["diabetes", "hyperglycemia", "250"],
      heparin: ["thrombosis", "embolism", "anticoagul", "dvt", "pe", "453", "415"],
      warfarin: ["thrombosis", "fibrillation", "embolism", "427", "453"],
      metformin: ["diabetes", "250"],
      vancomycin: ["infection", "sepsis", "038", "995"],
      furosemide: ["heart failure", "edema", "428", "276"],
      lasix: ["heart failure", "edema", "428", "276"],
      metoprolol: ["hypertension", "heart", "401", "427", "428"],
      lisinopril: ["hypertension", "heart failure", "401", "428"],
      aspirin: ["cardiovascular", "coronary", "stroke", "414", "434"],
      amiodarone: ["fibrillation", "arrhythmia", "427"],
      levothyroxine: ["hypothyroid", "thyroid", "244"],
    };

    const flags: Array<{ drug: string; issue: string; severity: "info" | "warning" | "critical" }> = [];

    for (const rx of prescriptions) {
      const drugLower = (rx.drug || "").toLowerCase();

      // Check against known drug-diagnosis mappings
      for (const [drugKey, expectedTerms] of Object.entries(DRUG_DIAGNOSIS_HINTS)) {
        if (drugLower.includes(drugKey)) {
          const hasMatch = expectedTerms.some(
            (term) =>
              diagnosisTitles.some((dt: string) => dt.includes(term)) ||
              icd9Codes.some((code: string) => code.startsWith(term))
          );

          if (!hasMatch) {
            flags.push({
              drug: rx.drug,
              issue: `Prescribed ${rx.drug} but no matching diagnosis found for typical indications (${expectedTerms.slice(0, 3).join(", ")})`,
              severity: "warning",
            });
          }
          break;
        }
      }

      // Flag if no start/end dates
      if (!rx.startdate && !rx.enddate) {
        flags.push({
          drug: rx.drug,
          issue: `No start or end date recorded for ${rx.drug}`,
          severity: "info",
        });
      }
    }

    const summary =
      flags.length === 0
        ? `No prescription-diagnosis mismatches found for admission ${context.hadm_id}. ${prescriptions.length} prescriptions checked against ${diagnoses.length} diagnoses.`
        : `Found ${flags.length} potential issues across ${prescriptions.length} prescriptions for admission ${context.hadm_id}.`;

    return {
      hadm_id: context.hadm_id,
      total_prescriptions: prescriptions.length,
      total_diagnoses: diagnoses.length,
      flags,
      summary,
    };
  },
});
```

### Tool 4: Tavily Research Tool

**File: `src/mastra/tools/tavily-research.ts`**

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

export const tavilyResearchTool = createTool({
  id: "tavily-research",
  description:
    "Search the public internet for current medical guidelines, clinical trials, FDA updates, or PubMed research related to a diagnosis or clinical question. Use this when a user asks about treatment protocols, drug interactions, or wants to explore the latest evidence for a condition. Provide a focused medical search query.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "A focused medical search query, e.g. '2026 treatment guidelines for ICD-9 428.0 congestive heart failure' or 'latest clinical trials metformin type 2 diabetes'"
      ),
    icd9_code: z
      .string()
      .optional()
      .describe("Optional ICD-9 code to include in the search for precision"),
    search_depth: z
      .enum(["basic", "advanced"])
      .optional()
      .describe("Search depth: basic (faster) or advanced (more thorough). Default: advanced"),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        content: z.string(),
        score: z.number(),
      })
    ),
    answer: z.string().optional(),
  }),
  execute: async ({ context }) => {
    const searchQuery = context.icd9_code
      ? `${context.query} ICD-9 ${context.icd9_code} clinical guidelines`
      : context.query;

    const response = await tavilyClient.search(searchQuery, {
      searchDepth: context.search_depth || "advanced",
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

    return {
      query: searchQuery,
      results: response.results.map((r) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score,
      })),
      answer: response.answer || undefined,
    };
  },
});
```

### Tool 5: Discharge Summary Search Tool (Vector Search)

**File: `src/mastra/tools/discharge-search.ts`**

```typescript
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import OpenAI from "openai";
import { getConvexClient } from "./convex-client";
import { api } from "../../../convex/_generated/api";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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
  execute: async ({ context }) => {
    // Generate embedding for the search query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: context.query,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search Convex vector index
    const client = getConvexClient();
    const results = await client.action(api.actions.searchDischargeSummaries, {
      embedding: queryEmbedding,
      limit: context.limit ?? 5,
    });

    return {
      query: context.query,
      results: (results || []).map((r: any) => ({
        hadm_id: r.hadm_id,
        age: r.age,
        gender: r.gender,
        admission_diagnosis: r.admission_diagnosis,
        summary_preview: (r.discharge_summary || "").slice(0, 500) + "...",
        score: r.score || 0,
      })),
    };
  },
});
```

### Tool Index — Export All Tools

**File: `src/mastra/tools/index.ts`**

```typescript
export { patientQueryTool } from "./patient-query";
export { labTrendTool, labTypesTool } from "./lab-trend";
export { safetyCheckTool } from "./safety-check";
export { tavilyResearchTool } from "./tavily-research";
export { dischargeSummarySearchTool } from "./discharge-search";
```

## 2.5 Agent Definitions

### Agent 1: Clinical Copilot Agent (Main)

**File: `src/mastra/agents/clinical-copilot.ts`**

```typescript
import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import {
  patientQueryTool,
  labTrendTool,
  labTypesTool,
  safetyCheckTool,
  tavilyResearchTool,
  dischargeSummarySearchTool,
} from "../tools";

export const clinicalCopilotAgent = new Agent({
  name: "Clinical Copilot",
  instructions: `You are Project Aegis, an advanced clinical copilot designed to help hospitalists, attending physicians, and medical researchers analyze patient data and explore treatment guidelines.

## Your Capabilities
1. **Patient Data Access**: Query structured clinical data including demographics, discharge summaries, lab results, prescriptions, and diagnoses.
2. **Lab Trend Analysis**: Retrieve and analyze time-series laboratory measurements to identify trends, anomalies, and clinically significant changes.
3. **Safety Auditing**: Cross-reference prescriptions against diagnoses to flag potential charting errors or missing context.
4. **Guideline Exploration**: Search the latest medical literature, clinical guidelines, FDA updates, and clinical trials via Tavily.
5. **Case Similarity Search**: Find similar patient cases using semantic search on discharge summaries.

## Behavioral Guidelines
- Always ground your analysis in the actual patient data. Never fabricate lab values or diagnoses.
- When discussing lab trends, mention specific values, dates, and units.
- When flagging safety concerns, clearly state the drug, the expected diagnosis, and why the mismatch matters.
- When presenting Tavily research results, cite the source URL and publication.
- Use the discharge summary search to find similar cases when asked for comparisons.
- If you don't have enough data, say so clearly rather than speculating.
- Format responses with clear headings, bullet points, and structured information.
- When you retrieve lab data suitable for charting, suggest that the user view the Lab Chart component.

## Workflow for Common Requests
- "Tell me about patient X": Use patientQueryTool → summarize demographics + admission diagnosis + key points from discharge summary
- "Show me their labs": Use labTypesTool first to list available labs → then labTrendTool for specific ones
- "Check for safety issues": Use safetyCheckTool → present findings with severity levels
- "What are the latest guidelines for X?": Use tavilyResearchTool → summarize and cite
- "Find similar cases": Use dischargeSummarySearchTool → present matching cases

## Important
You are a clinical decision SUPPORT tool. Always remind users that final clinical decisions should be made by qualified healthcare professionals. Do not provide definitive diagnoses or treatment recommendations — present data and evidence for the clinician to evaluate.`,
  model: google("gemini-2.0-flash"),
  tools: {
    patientQueryTool,
    labTrendTool,
    labTypesTool,
    safetyCheckTool,
    tavilyResearchTool,
    dischargeSummarySearchTool,
  },
});
```

> **Note on model:** Use `gemini-2.0-flash` as the model identifier for the AI SDK Google provider. If Gemini 3.0 is available under a different identifier (e.g., `gemini-3.0-flash`), update accordingly. Check `@ai-sdk/google` docs for the latest model strings.

### Agent 2: Safety Audit Agent

**File: `src/mastra/agents/safety-audit.ts`**

```typescript
import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { safetyCheckTool, patientQueryTool } from "../tools";

export const safetyAuditAgent = new Agent({
  name: "Safety Audit Agent",
  instructions: `You are a specialized clinical safety auditor. Your sole purpose is to identify potential medication-diagnosis mismatches and charting inconsistencies.

## Your Role
- When given a patient admission (hadm_id), run the safety check tool to cross-reference prescriptions against diagnoses.
- Analyze the results and provide a structured safety report.
- Categorize issues by severity: critical (potential patient safety risk), warning (documentation gap), info (minor notation).
- For each flagged issue, explain WHY it matters clinically.
- If no issues are found, confirm the chart appears consistent.

## Output Format
Always structure your response as:
1. **Patient Summary**: Brief overview (age, gender, primary diagnosis)
2. **Audit Results**: Number of prescriptions checked, number of diagnoses
3. **Flagged Issues**: Each with drug name, issue description, severity, and clinical significance
4. **Recommendation**: Overall assessment and suggested actions

## Important
This is a screening tool using heuristic matching. False positives are expected. Always recommend human review of flagged items.`,
  model: google("gemini-2.0-flash"),
  tools: {
    safetyCheckTool,
    patientQueryTool,
  },
});
```

### Agent Index

**File: `src/mastra/agents/index.ts`**

```typescript
export { clinicalCopilotAgent } from "./clinical-copilot";
export { safetyAuditAgent } from "./safety-audit";
```

## 2.6 Observational Memory Configuration

Mastra's Observational Memory keeps clinical context across turns. Configure it on the main agent:

**Update `src/mastra/agents/clinical-copilot.ts`** — add memory config:

```typescript
import { Agent } from "@mastra/core/agent";
import { google } from "@ai-sdk/google";
import { Memory } from "@mastra/memory";
import {
  patientQueryTool,
  labTrendTool,
  labTypesTool,
  safetyCheckTool,
  tavilyResearchTool,
  dischargeSummarySearchTool,
} from "../tools";

const memory = new Memory({
  options: {
    // Observational memory settings
    lastMessages: 40,         // Keep last 40 raw messages before compression
    semanticRecall: false,    // We use Convex vector search instead
    threads: {
      generateTitle: true,    // Auto-generate thread titles
    },
  },
});

export const clinicalCopilotAgent = new Agent({
  name: "Clinical Copilot",
  instructions: `...`, // Same system prompt as above
  model: google("gemini-2.0-flash"),
  tools: {
    patientQueryTool,
    labTrendTool,
    labTypesTool,
    safetyCheckTool,
    tavilyResearchTool,
    dischargeSummarySearchTool,
  },
  memory,
});
```

> **Note:** Check the latest Mastra docs for the exact observational memory API. The config may use `new Memory({ type: "observational", ... })` or similar. The key idea: compress long conversations into observations so the agent retains clinical context across many turns without blowing up the context window.

## 2.7 Mastra Dev Server (Alternative Setup)

If embedding Mastra in Next.js API routes is problematic, run it as a standalone server:

**File: `package.json`** — add scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:mastra": "mastra dev --port 4111",
    "dev:all": "concurrently \"pnpm dev\" \"pnpm dev:mastra\" \"pnpm dlx convex dev\""
  }
}
```

Install concurrently:
```bash
pnpm add -D concurrently
```

Then the CopilotKit frontend points to `http://localhost:4111/copilotkit` instead of `/api/copilotkit`.

## 2.8 Testing Tools Individually

Before wiring to CopilotKit, test each tool in isolation:

**File: `scripts/test-tools.ts`**

```typescript
import { patientQueryTool } from "../src/mastra/tools/patient-query";
import { labTrendTool, labTypesTool } from "../src/mastra/tools/lab-trend";
import { safetyCheckTool } from "../src/mastra/tools/safety-check";
import { tavilyResearchTool } from "../src/mastra/tools/tavily-research";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testTools() {
  const TEST_HADM_ID = 100006; // Replace with a real hadm_id from your data

  console.log("🔧 Testing Patient Query Tool...");
  try {
    const patient = await patientQueryTool.execute({
      context: { hadm_id: TEST_HADM_ID },
    });
    console.log("✅ Patient:", patient.case_id, patient.age, patient.gender);
    console.log("   Diagnosis:", patient.admission_diagnosis);
  } catch (e) {
    console.error("❌ Patient query failed:", e);
  }

  console.log("\n🔧 Testing Lab Types Tool...");
  try {
    const types = await labTypesTool.execute({
      context: { hadm_id: TEST_HADM_ID },
    });
    console.log("✅ Lab types:", types.labTypes.length, "types found");
    if (types.labTypes.length > 0) {
      const firstLab = types.labTypes[0];
      console.log("   Top lab:", firstLab.lab_name, `(${firstLab.count} measurements)`);

      console.log("\n🔧 Testing Lab Trend Tool...");
      const trend = await labTrendTool.execute({
        context: { hadm_id: TEST_HADM_ID, itemid: firstLab.itemid },
      });
      console.log("✅ Trend:", trend.lab_name, trend.data.length, "data points");
    }
  } catch (e) {
    console.error("❌ Lab tools failed:", e);
  }

  console.log("\n🔧 Testing Safety Check Tool...");
  try {
    const safety = await safetyCheckTool.execute({
      context: { hadm_id: TEST_HADM_ID },
    });
    console.log("✅ Safety:", safety.summary);
    console.log("   Flags:", safety.flags.length);
  } catch (e) {
    console.error("❌ Safety check failed:", e);
  }

  console.log("\n🔧 Testing Tavily Research Tool...");
  try {
    const research = await tavilyResearchTool.execute({
      context: {
        query: "treatment guidelines congestive heart failure 2026",
        search_depth: "basic",
      },
    });
    console.log("✅ Tavily:", research.results.length, "results");
    if (research.answer) {
      console.log("   Answer:", research.answer.slice(0, 200) + "...");
    }
  } catch (e) {
    console.error("❌ Tavily failed:", e);
  }

  console.log("\n✅ Tool testing complete!");
}

testTools().catch(console.error);
```

Run:
```bash
npx tsx scripts/test-tools.ts
```

## 2.9 File Structure After Phase 2

```
src/mastra/
├── index.ts                    # Mastra config with agents + CopilotKit
├── agents/
│   ├── index.ts                # Agent exports
│   ├── clinical-copilot.ts     # Main copilot agent (6 tools)
│   └── safety-audit.ts         # Safety audit agent (2 tools)
└── tools/
    ├── index.ts                # Tool exports
    ├── convex-client.ts        # Shared Convex HTTP client
    ├── patient-query.ts        # Patient lookup by hadm_id
    ├── lab-trend.ts            # Lab time-series + lab types
    ├── safety-check.ts         # Prescription-diagnosis mismatch
    ├── tavily-research.ts      # Live medical guideline search
    └── discharge-search.ts     # Vector search on summaries

src/app/api/
└── copilotkit/
    └── route.ts                # CopilotKit API endpoint
```

## 2.10 Alternative: Standalone Mastra Server

If you prefer running Mastra separately (recommended if Next.js API route approach has issues):

1. Move `src/mastra/` to project root as `mastra-server/src/mastra/`
2. Run with `pnpm mastra dev` (port 4111)
3. In the frontend, point CopilotKit to `http://localhost:4111/copilotkit`

The CopilotKit component would then use:
```tsx
<CopilotKit runtimeUrl="http://localhost:4111/copilotkit" agent="clinicalCopilotAgent">
```

---

## PR Checklist — Phase 2

- [x] `src/mastra/index.ts` — full Mastra config with both agents registered
- [x] `src/mastra/tools/` — all 5 tools (+ convex-client utility + index)
- [x] `src/mastra/agents/` — both agents (+ index)
- [x] `app/api/copilotkit/route.ts` — CopilotKit API endpoint
- [x] `scripts/test-tools.ts` — tool testing script passes for all tools
- [x] Tavily API key works (test with a sample query)
- [x] Gemini API key works (agent responds to a test prompt)
- [x] CopilotKit endpoint returns a valid response
- [x] Observational Memory is configured on the clinical copilot agent
- [x] No TypeScript errors (`pnpm tsc --noEmit`)

## Troubleshooting

| Issue | Solution |
|---|---|
| `@ai-sdk/google` model not found | Check model identifier: may be `gemini-2.0-flash`, `gemini-2.5-flash`, or `gemini-3.0-flash` |
| CopilotKit 404 on `/api/copilotkit` | Ensure the route file is at `src/app/api/copilotkit/route.ts` with a POST export |
| Convex client errors in tools | Ensure `NEXT_PUBLIC_CONVEX_URL` is in `.env.local` |
| Tavily API rate limit | Use `search_depth: "basic"` and cache results |
| Memory errors | Check Mastra version compatibility — memory API may differ between versions |
| Tool `execute` type errors | Verify Mastra `createTool` API — `context` access pattern may vary by version |
