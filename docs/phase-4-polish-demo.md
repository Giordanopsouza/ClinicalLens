# Phase 4: Polish, Demo & Pitch — Ship It

**Owner:** Person 4 (Demo & QA Lead)
**Branch:** `phase-4-polish` (from `main` after Phase 3 merge)
**Time estimate:** ~2-3 hours
**Depends on:** All previous phases merged and working

This phase is about making the app demo-ready: end-to-end testing, UI polish, error handling, the demo script, README, and pitch deck outline. This is the difference between "it works" and "it wins."

---

## 4.1 End-to-End Smoke Test

Before polishing, verify every feature works. Run through this manual test checklist:

### Pre-flight
- [ ] `pnpm dev` starts Next.js on `localhost:3000`
- [ ] `pnpm dlx convex dev` is running and synced
- [ ] Mastra agent is accessible (either embedded or standalone on `:4111`)
- [ ] `.env.local` has valid keys: `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXT_PUBLIC_CONVEX_URL`, `TAVILY_API_KEY`, `OPENAI_API_KEY`

### Feature 1: Patient Context Canvas
- [ ] Patient list loads in sidebar (>100 patients visible)
- [ ] Search/filter works (type a diagnosis keyword)
- [ ] Clicking a patient populates the detail view
- [ ] **Summary tab**: Discharge summary displays fully
- [ ] **Labs tab**: Lab type badges load; clicking one renders a chart
- [ ] **Medications tab**: Prescription table renders with all columns
- [ ] **Diagnoses tab**: ICD-9 codes with titles render; "Explore" button present

### Feature 2: Multi-Agent Safety Check
- [ ] In chat, type: "Run a safety check on this patient"
- [ ] Agent invokes `safetyCheckTool` and returns structured results
- [ ] Safety alert card renders in chat (Generative UI) with color-coded severity
- [ ] If no flags, agent reports "chart appears consistent"

### Feature 3: Live Guideline Exploration via Tavily
- [ ] Click "Explore" button next to any diagnosis
- [ ] Chat receives the query and agent invokes `tavilyResearchTool`
- [ ] Guideline card renders in chat with source links, relevance scores, and AI summary
- [ ] Links open in new tab

### Chat Functionality
- [ ] Agent knows the selected patient (via `useCopilotReadable`)
- [ ] Agent can answer: "Tell me about this patient"
- [ ] Agent can answer: "What labs are available?"
- [ ] Agent can render lab chart in chat (Generative UI)
- [ ] Agent can search for similar cases: "Find similar patients"
- [ ] Conversation persists across turns (Observational Memory)

### UI/UX
- [ ] Dark mode renders correctly
- [ ] Light mode renders correctly
- [ ] Theme toggle works without page reload
- [ ] No layout overflow — sidebar, main, and chat scroll independently
- [ ] Responsive at 1280px+ width

## 4.2 UI Polish

### Loading States

Add skeleton loaders anywhere data is fetched. These should already exist from Phase 3, but verify and improve:

**Checklist:**
- [ ] Patient sidebar: skeleton cards while loading
- [ ] Patient header: skeleton while loading
- [ ] Labs view: skeleton while fetching lab types
- [ ] Lab chart: skeleton while fetching trend data
- [ ] Prescription table: skeleton while loading
- [ ] Diagnosis list: skeleton while loading
- [ ] Chat: typing indicator while agent is responding

### Error Boundaries

**File: `src/components/error-boundary.tsx`**

```tsx
"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {this.props.fallbackMessage ||
                "An error occurred while loading this component."}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground/70">
              {this.state.error?.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => this.setState({ hasError: false })}
            >
              <RefreshCw className="mr-1.5 h-3 w-3" />
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

Wrap key sections in the dashboard page:

```tsx
<ErrorBoundary fallbackMessage="Failed to load patient list">
  <PatientSidebar />
</ErrorBoundary>

<ErrorBoundary fallbackMessage="Failed to load patient details">
  <PatientDetail />
</ErrorBoundary>
```

### Empty States

Ensure each component handles the "no data" case gracefully:

- **No patients**: "No patients match your search"
- **No labs**: "No laboratory measurements recorded for this admission"
- **No prescriptions**: "No prescriptions on record"
- **No diagnoses**: "No diagnosis codes recorded"
- **No safety flags**: Green checkmark with "Chart review passed — no mismatches found"
- **No Tavily results**: "No guidelines found. Try a broader search term."

### Streaming Indicator

If the agent supports streaming responses (via AG-UI), the CopilotKit chat should show a typing indicator. CopilotKit handles this by default, but verify it looks good with your theme.

### Animations (Optional — Time Permitting)

Add subtle entrance animations to cards:

```css
/* In globals.css */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

Apply `className="animate-fade-in"` to Generative UI cards.

## 4.3 Footer Disclaimer

**File: `src/components/layout/footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 px-4 py-2">
      <p className="text-center text-xs text-muted-foreground">
        <strong>Disclaimer:</strong> Project Aegis is a clinical decision{" "}
        <em>support</em> tool for research and educational purposes only. Not
        intended for real clinical use. Always consult qualified healthcare
        professionals for medical decisions.
      </p>
    </footer>
  );
}
```

Add it to the dashboard page, after the three-panel flex container.

## 4.4 README.md

**File: `README.md`** (project root)

```markdown
# Project Aegis — The Visual-Textual Clinical Copilot

> A hackathon project for Track 2: Creative AI Applications for Novel Clinical Exploration

Project Aegis is an AI-powered clinical copilot that helps hospitalists and medical researchers synthesize fragmented patient data — discharge summaries, lab trends, prescriptions, and diagnoses — while seamlessly connecting to live medical guidelines.

## Features

### 1. Patient Context Canvas (Generative UI)
Instead of plain text responses, the AI renders interactive charts, tables, and cards directly in the chat. Ask about kidney function and see a creatinine sparkline — not just a text summary.

### 2. Multi-Agent Safety Auditing
A background safety agent cross-references prescriptions against diagnoses to flag potential charting errors, missing context, or drug-indication mismatches.

### 3. Live Guideline Exploration (Tavily)
Click "Explore" on any diagnosis to pull the latest 2026 treatment guidelines, FDA updates, and clinical trials from PubMed, NIH, and other medical sources — right inside the dashboard.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Next.js Frontend                  │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Patient  │  │   Patient    │  │  CopilotKit   │  │
│  │ Sidebar  │  │   Detail     │  │  Chat Panel   │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘  │
│       │               │                  │           │
│       └───────────────┼──────────────────┘           │
│                       │ useCopilotReadable            │
│                       │ useCopilotAction              │
├───────────────────────┼─────────────────────────────┤
│              AG-UI / CopilotKit Runtime              │
├───────────────────────┼─────────────────────────────┤
│                  Mastra.ai Agents                    │
│  ┌────────────────────┼────────────────────────────┐ │
│  │ Clinical Copilot Agent                          │ │
│  │  Tools: PatientQuery, LabTrend, SafetyCheck,    │ │
│  │         TavilyResearch, DischargeSummarySearch   │ │
│  ├─────────────────────────────────────────────────┤ │
│  │ Safety Audit Agent                              │ │
│  │  Tools: SafetyCheck, PatientQuery               │ │
│  └─────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────┤
│  Convex (DB + Vector Search)  │  Tavily Search API   │
│  6 tables from MIMIC data     │  Live medical search  │
│  Vector index on summaries    │  PubMed, NIH, FDA     │
└───────────────────────────────┴──────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TailwindCSS, shadcn/ui, Recharts |
| AI Chat | CopilotKit (Generative UI, useCopilotReadable, useCopilotAction) |
| Agent Framework | Mastra.ai (TypeScript, Observational Memory) |
| LLM | Google Gemini 3.0 |
| Database | Convex (structured data + vector search) |
| External Search | Tavily Search API |
| Data Source | MIMIC Clinical Database (via HuggingFace) |

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- API Keys: Google Gemini, Convex, Tavily, OpenAI (embeddings)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd the-team
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your API keys in .env.local

# 3. Initialize Convex
pnpm dlx convex dev

# 4. Download and seed data
npx tsx scripts/download-data.ts
npx tsx scripts/seed-convex.ts
npx tsx scripts/generate-embeddings.ts

# 5. Start development
pnpm dev
# In a separate terminal: pnpm dlx convex dev
```

Open [http://localhost:3000](http://localhost:3000).

## Dataset

- **Source:** [bavehackathon/2026-healthcare-ai](https://huggingface.co/datasets/bavehackathon/2026-healthcare-ai)
- **Size:** ~2000 hospital admissions
- **Tables:** clinical_cases, labs, prescriptions, diagnoses + dictionaries
- **Derived from:** MIMIC Clinical Database

## Team

Built in 24-48 hours by a team of 4 at the 2026 Clinical AI Hackathon.

## License

MIT
```

## 4.5 Demo Script — The "Aha!" Moment

This is the script the presenter follows during the demo. Timing: ~5 minutes.

### Setup (before demo)
1. Have the app running at `localhost:3000` in dark mode
2. Pre-select a patient with rich data (many labs, prescriptions, diagnoses)
3. Clear the chat history

### Script

**[0:00 — 0:30] The Problem**
> "Clinicians deal with fragmented data every day. Lab results in one system, prescriptions in another, discharge notes in a third. And when they need to check the latest guidelines? That's yet another browser tab. Project Aegis brings it all together."

**[0:30 — 1:30] Feature 1: Patient Context Canvas**
1. Click on a patient in the sidebar (choose one with "PNEUMONIA" or "CONGESTIVE HEART FAILURE")
2. Show the Summary tab — scroll through the discharge summary
3. Switch to Labs tab — click on "Hemoglobin" or "Creatinine" badge → chart appears
4. Type in chat: **"Tell me about this patient's kidney function"**
5. Agent responds with structured analysis + renders a **lab chart card** directly in the chat
6. > "Notice how the AI doesn't just give text — it renders an interactive chart right in the conversation."

**[1:30 — 2:30] Feature 2: Safety Audit**
1. Type in chat: **"Run a safety check on this patient"**
2. Agent runs the `safetyCheckTool` and returns results
3. Safety alert card renders in chat with color-coded flags
4. > "The safety agent cross-referenced every prescription against the patient's diagnoses. It found [X] potential flags — like this insulin prescription with no corresponding diabetes diagnosis. This could be a charting error that might get missed during a handoff."

**[2:30 — 3:30] Feature 3: Live Guideline Exploration (The "Aha!" Moment)**
1. Switch to the Diagnoses tab
2. Find an interesting diagnosis (e.g., "Congestive Heart Failure" — ICD-9 428.0)
3. Click the **"Explore"** button next to it
4. Chat receives the query → Tavily searches the web → guideline cards render
5. > "Here's where it gets powerful. We just went from a local patient record to live 2026 treatment guidelines from PubMed and NIH — in one click. The clinician doesn't need to open another browser. The context flows seamlessly."

**[3:30 — 4:30] Bonus: Similar Case Search**
1. Type: **"Find patients with similar presentations to this one"**
2. Agent uses vector search on discharge summaries
3. Returns a list of similar cases with relevance scores
4. > "We embedded all 2000 discharge summaries using vector search. The AI can now find similar historical cases — great for researchers or residents learning from past presentations."

**[4:30 — 5:00] Wrap-up**
> "Project Aegis combines Mastra agents, CopilotKit Generative UI, Convex real-time data, and Tavily live search into a single clinical copilot. It's not just a chatbot — it's a data synthesis tool that meets clinicians where they work. Thank you."

## 4.6 Pitch Deck Outline

If slides are needed, here's the structure:

| Slide | Content |
|---|---|
| **1. Title** | Project Aegis — The Visual-Textual Clinical Copilot |
| **2. Problem** | Clinician cognitive overload: fragmented data + outdated guidelines |
| **3. Audience** | Hospitalists, attendings, researchers, residents |
| **4. Solution** | AI copilot that synthesizes patient data + live guidelines in one UI |
| **5. Demo Screenshot** | Three-panel dashboard with chart rendered in chat |
| **6. Architecture** | Mermaid diagram: Next.js → CopilotKit → Mastra → Convex + Tavily |
| **7. Key Features** | 3 features with rubric alignment (Usefulness, Safety, Creativity) |
| **8. Tech Innovation** | Generative UI, Observational Memory, Vector Search, Live Guidelines |
| **9. Impact** | Faster handoffs, fewer charting errors, evidence-based decisions |
| **10. Team & Future** | Team intro, future: FHIR integration, real EHR connection |

## 4.7 Observational Memory Tuning

Fine-tune the Mastra memory settings for clinical context:

```typescript
const memory = new Memory({
  options: {
    lastMessages: 50,           // Clinicians have long conversations
    semanticRecall: false,      // Using Convex vector search instead
    threads: {
      generateTitle: true,      // "Patient #12345 - Kidney Function Review"
    },
  },
});
```

**Key tuning considerations:**
- **Increase `lastMessages`** if conversations are long (multiple patient reviews in one session)
- **Observation threshold**: If Mastra supports configuring when observations compress, set it higher for clinical contexts (more raw context = better clinical reasoning)
- **Thread titles**: Useful for session tracking — "Patient 186245 — Safety Audit"

## 4.8 Edge Case Handling

| Edge Case | Handling |
|---|---|
| **Patient with no labs** | Show "No lab data available" in Labs tab; agent says so in chat |
| **Patient with no prescriptions** | Empty state message in Medications tab |
| **Patient with no discharge summary** | Show "No summary available" + agent notes the limitation |
| **Tavily rate limit** | Catch 429 errors, show "Search temporarily unavailable, try again shortly" |
| **Very long discharge summary** | Truncate display to 5000 chars with "Show more" button; agent gets full text |
| **Unknown ICD-9 code** | Show raw code with "Code not in dictionary" |
| **Convex query timeout** | ErrorBoundary catches and shows retry button |
| **Gemini API error** | CopilotKit shows "Agent unavailable" message |
| **No embedding for a case** | Vector search excludes it; agent notes limitation |
| **Multiple patients reviewed** | Observational Memory compresses earlier context |

## 4.9 Performance Optimizations

1. **Convex query deduplication**: Convex React hooks automatically deduplicate identical queries — no extra work needed
2. **Agent response streaming**: CopilotKit + AG-UI supports streaming by default. Verify the agent streams tokens (not batch response)
3. **Chart lazy loading**: Only render Recharts when the Labs tab is active (already handled by Tabs component)
4. **Embedding caching**: Embeddings are pre-computed (Phase 1), so vector search is fast
5. **Tavily result caching**: Consider caching Tavily results in Convex to avoid repeated API calls for the same diagnosis

## 4.10 Final File Checklist

After Phase 4, ensure these files exist and are correct:

```
✅ README.md                              — Setup guide + architecture
✅ .env.example                           — All required env vars
✅ convex/schema.ts                       — 6 tables + vector index
✅ convex/mutations.ts                    — Seed mutations
✅ convex/queries.ts                      — 7 query functions
✅ convex/actions.ts                      — Vector search action
✅ scripts/download-data.ts               — Data downloader
✅ scripts/parse-csv.ts                   — CSV parser
✅ scripts/seed-convex.ts                 — Seeder
✅ scripts/generate-embeddings.ts         — Embedding generator
✅ scripts/verify-seed.ts                 — Data verification
✅ src/mastra/index.ts                    — Mastra config
✅ src/mastra/agents/clinical-copilot.ts  — Main agent
✅ src/mastra/agents/safety-audit.ts      — Safety agent
✅ src/mastra/tools/*.ts                  — 5 tools + utility
✅ src/app/api/copilotkit/route.ts        — CopilotKit endpoint
✅ src/app/layout.tsx                     — Root layout with providers
✅ src/app/page.tsx                       — Dashboard page
✅ src/components/providers/*.tsx          — Convex, Theme, CopilotKit
✅ src/components/layout/header.tsx        — Header
✅ src/components/layout/footer.tsx        — Footer disclaimer
✅ src/components/patients/*.tsx           — Sidebar, Detail, Summary
✅ src/components/labs/*.tsx               — Labs view, Lab chart
✅ src/components/prescriptions/*.tsx      — Prescription table
✅ src/components/diagnoses/*.tsx          — Diagnosis list, Explore button
✅ src/components/chat/*.tsx               — Clinical chat + generative UI
✅ src/components/error-boundary.tsx       — Error boundary
✅ src/context/patient-context.tsx         — Patient selection state
✅ docs/phase-0-project-setup.md          — Phase 0 doc
✅ docs/phase-1-data-foundation.md        — Phase 1 doc
✅ docs/phase-2-mastra-agents.md          — Phase 2 doc
✅ docs/phase-3-frontend.md               — Phase 3 doc
✅ docs/phase-4-polish-demo.md            — Phase 4 doc (this file)
```

---

## PR Checklist — Phase 4

- [ ] All smoke tests pass (Section 4.1)
- [ ] Error boundary wraps key components
- [ ] Empty states render for all "no data" scenarios
- [ ] Loading skeletons show on all data-fetching components
- [ ] Footer disclaimer is visible
- [ ] `README.md` has setup instructions, architecture diagram, and team info
- [ ] Demo script tested end-to-end (5-minute narrative works smoothly)
- [ ] Dark mode looks polished
- [ ] Light mode looks polished
- [ ] No console errors in browser dev tools
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] `data/` is in `.gitignore`
- [ ] `.env.local` is in `.gitignore`
- [ ] Git history is clean (squash messy commits if needed)
