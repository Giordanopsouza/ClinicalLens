# Phase 0: Project Setup — Shared Foundation

**Owner:** Team Lead
**Time estimate:** ~1-2 hours
**Prerequisite for:** All other phases

This phase scaffolds the entire project: Next.js app, Convex database, Mastra agent framework, and all dependencies. Every team member pulls from this branch before starting their phase.

---

## 0.1 Initialize the Next.js App

```bash
cd /Users/karanbalaji/Documents/coding-projects/the-team
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

Verify it runs:
```bash
pnpm dev
```

## 0.2 Install All Dependencies

Run this single command to install everything the project needs across all phases:

```bash
pnpm add convex @mastra/core @mastra/client-js @ag-ui/mastra @ag-ui/core @ag-ui/client @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime @tavily/core @google/generative-ai ai @ai-sdk/google recharts next-themes papaparse zod lucide-react
```

Dev dependencies:
```bash
pnpm add -D @types/papaparse
```

Initialize shadcn/ui:
```bash
pnpm dlx shadcn@latest init
```

When prompted, choose:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Add commonly needed shadcn components:
```bash
pnpm dlx shadcn@latest add button card input table badge alert dialog sheet tabs scroll-area separator skeleton tooltip
```

## 0.3 Initialize Convex

```bash
pnpm dlx convex dev
```

This will prompt you to log in and create a new project. Name it `project-aegis`.

This creates the `convex/` directory at the project root. Keep the `convex dev` process running during development — it syncs your schema and functions automatically.

## 0.4 Convex Schema Definition

Create the full schema covering all 6 CSV datasets plus a vector index on discharge summaries.

**File: `convex/schema.ts`**

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Core Clinical Cases ───────────────────────────────────────
  clinical_cases: defineTable({
    case_id: v.string(),
    subject_id: v.number(),
    hadm_id: v.number(),
    age: v.number(),
    gender: v.string(),
    admission_diagnosis: v.string(),
    discharge_summary: v.string(),
    // Vector embedding of discharge_summary for semantic search
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_hadm_id", ["hadm_id"])
    .index("by_subject_id", ["subject_id"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // text-embedding-3-small
      filterFields: ["hadm_id", "gender"],
    }),

  // ─── Laboratory Measurements ───────────────────────────────────
  labs: defineTable({
    hadm_id: v.number(),
    itemid: v.number(),
    charttime: v.string(), // ISO datetime string
    value: v.optional(v.float64()),
    valuestr: v.optional(v.string()), // some lab values are strings
    unit: v.optional(v.string()),
  })
    .index("by_hadm_id", ["hadm_id"])
    .index("by_hadm_id_itemid", ["hadm_id", "itemid"]),

  // ─── Lab Dictionary ────────────────────────────────────────────
  lab_dictionary: defineTable({
    itemid: v.number(),
    lab_name: v.string(),
    fluid: v.optional(v.string()),
    category: v.optional(v.string()),
  }).index("by_itemid", ["itemid"]),

  // ─── Prescriptions ────────────────────────────────────────────
  prescriptions: defineTable({
    subject_id: v.number(),
    hadm_id: v.number(),
    drug: v.string(),
    dose_value: v.optional(v.string()), // stored as string since CSV may have mixed formats
    dose_unit: v.optional(v.string()),
    route: v.optional(v.string()),
    startdate: v.optional(v.string()),
    enddate: v.optional(v.string()),
  })
    .index("by_hadm_id", ["hadm_id"])
    .index("by_subject_id", ["subject_id"]),

  // ─── Diagnoses ─────────────────────────────────────────────────
  diagnoses: defineTable({
    subject_id: v.number(),
    hadm_id: v.number(),
    seq_num: v.number(),
    icd9_code: v.string(),
  })
    .index("by_hadm_id", ["hadm_id"])
    .index("by_icd9_code", ["icd9_code"]),

  // ─── Diagnosis Dictionary ──────────────────────────────────────
  diagnosis_dictionary: defineTable({
    icd9_code: v.string(),
    short_title: v.string(),
    long_title: v.string(),
  }).index("by_icd9_code", ["icd9_code"]),
});
```

## 0.5 Mastra Directory Structure

Create the Mastra directory inside `src/`:

```bash
mkdir -p src/mastra/agents src/mastra/tools
```

Create placeholder files that Phase 2 will fill in:

**File: `src/mastra/index.ts`**

```typescript
import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";

// Agents will be imported here in Phase 2
// import { clinicalCopilotAgent } from "./agents/clinical-copilot";

export const mastra = new Mastra({
  // agents: { clinicalCopilotAgent },
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

## 0.6 Environment Variables

**File: `.env.example`**

```env
# ─── LLM Provider ────────────────────────────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# ─── Convex ──────────────────────────────────────────────────────
CONVEX_DEPLOYMENT=your_convex_deployment_here
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# ─── Tavily Search API ───────────────────────────────────────────
TAVILY_API_KEY=your_tavily_api_key_here

# ─── OpenAI (for embeddings only) ────────────────────────────────
OPENAI_API_KEY=your_openai_api_key_here
```

Copy to `.env.local`:
```bash
cp .env.example .env.local
```

Add `.env.local` to `.gitignore` if not already present.

## 0.7 Directory Structure

After Phase 0 is complete, the project should look like this:

```
the-team/
├── convex/
│   ├── _generated/          # Auto-generated by Convex
│   ├── schema.ts            # ✅ Full schema (6 tables + vector index)
│   ├── seed.ts              # Phase 1 will create
│   ├── queries.ts           # Phase 1 will create
│   └── mutations.ts         # Phase 1 will create
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout (providers go here)
│   │   ├── page.tsx         # Home page
│   │   └── api/
│   │       └── copilotkit/  # Phase 2 will create API route
│   ├── components/          # Phase 3 will populate
│   │   └── ui/              # shadcn/ui components (auto-generated)
│   ├── lib/
│   │   └── utils.ts         # shadcn utility (cn function)
│   └── mastra/
│       ├── index.ts         # ✅ Mastra entry point (placeholder)
│       ├── agents/          # Phase 2 will populate
│       └── tools/           # Phase 2 will populate
├── data/                    # Phase 1 will create (CSV downloads)
├── scripts/                 # Phase 1 will create (seed scripts)
├── docs/                    # You are here
├── .env.example             # ✅ Template
├── .env.local               # Local secrets (git-ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── convex.json              # Auto-generated by Convex init
```

## 0.8 Git Branching Strategy

```bash
# Initialize repo
git init
git add .
git commit -m "Phase 0: Project scaffold with Next.js, Convex, Mastra, CopilotKit"

# Create main branch
git branch -M main

# Each team member creates their branch FROM the previous phase's branch:
# Phase 1: git checkout -b phase-1-data       (from main)
# Phase 2: git checkout -b phase-2-agents      (from phase-1-data after merge)
# Phase 3: git checkout -b phase-3-frontend    (from phase-2-agents after merge)
# Phase 4: git checkout -b phase-4-polish      (from phase-3-frontend after merge)
```

**PR merge order:**
1. `phase-1-data` → `main`
2. `phase-2-agents` → `main` (rebase on latest main first)
3. `phase-3-frontend` → `main`
4. `phase-4-polish` → `main`

## 0.9 Convex Provider Setup

Update the root layout to include the Convex provider:

**File: `src/app/layout.tsx`** (update the body content)

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Aegis — Clinical Copilot",
  description: "Visual-Textual Clinical Copilot for Healthcare AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**File: `src/components/providers/convex-provider.tsx`**

```tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

**File: `src/components/providers/theme-provider.tsx`**

```tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

---

## PR Checklist — Phase 0

- [x] `pnpm dev` starts without errors
- [x] `pnpm dlx convex dev` syncs schema without errors
- [x] All shadcn/ui components installed and importable
- [x] `convex/schema.ts` defines all 6 tables with correct indexes
- [x] `src/mastra/index.ts` exists with placeholder config
- [x] `.env.example` has all required keys documented
- [x] Convex + Theme providers wired in root layout
- [x] Directory structure matches the diagram above
- [x] Git repo initialized, initial commit on `main`
