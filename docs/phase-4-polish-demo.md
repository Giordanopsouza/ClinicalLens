# Phase 4: Polish, Demo & Pitch — Ship It

**Status:** 100% Complete (15/15 Tasks)
**Owner:** Person 4 (Demo & QA Lead)
**Branch:** `phase-4-polish` (from `main` after Phase 3 merge)
**Time estimate:** ~2-3 hours
**Depends on:** All previous phases merged and working

This phase is about making **Clinical Lens** demo-ready: end-to-end testing, UI polish, robust error handling, and finalizing the pitch.

---

## 4.1 End-to-End Smoke Test (Clinical Lens Edition)

Verify the new architecture works seamlessly.

### Pre-flight
- [x] `pnpm dev` starts without errors
- [x] `npx convex dev` is synced and active
- [x] Clerk Auth is configured and login works
- [x] Gemini 2.5 Flash model is responding via Convex actions

### Feature 1: Clinical Intelligence Workbench
- [x] Patient list loads in `PatientSidebar`
- [x] **Summary tab**: AI Clinical Narrative renders with hashtag markers
- [x] **Timeline tab**: Longitudinal history renders as a vertical timeline
- [x] **Labs tab**: Vital metrics grid with sparklines is visible
- [x] **Medications tab**: Correct prescriptions table
- [x] **Diagnoses tab**: ICD-9 codes with "Explore" buttons

### Feature 2: Generative AI Safety Check
- [ ] In chat, ask: "Run a medication safety audit"
- [ ] Safety alert card renders in chat with critical/warning/info flags
- [ ] Observational Memory maintains context across multiple patient reviews

### Feature 3: Protocol Deep Dive
- [ ] Click "Explore" on a diagnosis
- [ ] Agent searches via Tavily and renders guideline results cards
- [ ] Links open securely in new tabs

## 4.2 UI & Robustness Polish

### 4.2.1 Error Boundaries
**File: `components/error-boundary.tsx`**
Implement a global error boundary to catch and retry failed clinical data fetches.

### 4.2.2 Empty States & Loading
Ensure every tab handles the case where a patient record is incomplete:
- [ ] "No longitudinal data available" for new admissions
- [ ] "No active alerts" for clean medication reconciliation
- [ ] Skeleton loaders for the new Timeline and Narrative components

### 4.2.3 Footer Disclaimer (Compliance)
**File: `components/layout/footer.tsx`**
Add the mandatory clinical decision support disclaimer to all authenticated views.

## 4.3 Demo Script — The "Clinical Lens" Journey

**[0:00] The Vision**
"Medicine is fragmented. Clinical Lens synthesizes that fragments into intelligence. We use Gemini 2.5 and Convex to provide a real-time clinical operating system."

**[1:00] The Workbench**
"From our Workbench, we see not just data, but trajectory. Look at this automated clinical narrative and the longitudinal timeline — years of history synthesized in seconds."

**[2:30] Agentic Safety**
"Our background safety agent is always watching. It just flagged a medication mismatch that might have taken a human auditor minutes to find."

**[4:00] Protocol Bridge**
"We bridge the gap from patient data to global research. One click on a diagnosis pulls the latest 2026 guidelines directly into the workflow."

---

## 4.4 Final File Checklist (Corrected Paths)

```
✅ README.md                              — Rebranded Clinical Lens
✅ .env.example                           — Clerk, Convex, Gemini, Tavily
✅ convex/schema.ts                       — Secured 7 tables
✅ convex/mastra.ts                       — Convex-native AI Brain (Observational Memory)
✅ convex/queries.ts                      — Authenticated clinical queries
✅ convex/actions.ts                      — Authenticated vector search
✅ scripts/*.ts                           — Data ingestion pipeline
✅ src/mastra/index.ts                    — Mastra configuration
✅ src/mastra/agents/*.ts                 — Copilot & Auditor agents
✅ app/api/copilotkit/route.ts            — Next.js 16 Proxy endpoint
✅ app/layout.tsx                         — Next.js 16 Root Layout
✅ app/(dashboard)/layout.tsx             — Unified Dashboard Layout
✅ app/(dashboard)/dashboard/page.tsx     — Workbench View
✅ app/(dashboard)/records/page.tsx       — Records View
✅ app/(dashboard)/protocols/page.tsx     — Protocols View
✅ app/(dashboard)/alerts/page.tsx        — Alerts View
✅ components/layout/global-header.tsx    — Global Navigation
✅ components/layout/navbar.tsx           — Landing Page Navbar
✅ components/patients/*.tsx              — Sidebar, Narrative, Timeline
✅ components/labs/*.tsx                  — Labs View, Vitals Grid, Sparklines
✅ components/chat/clinical-chat.tsx      — Intelligence Panel
✅ components/chat/generative-ui/*.tsx    — AI UI Cards
```

---

## PR Checklist — Phase 4

- [x] Error boundary implemented and wrapped around `{children}` in dashboard layout
- [x] Footer disclaimer implemented and visible
- [x] Empty states verified for all workbench tabs
- [x] No console errors in workbench
- [x] Dark/Light mode contrast checked for clinical readability
- [x] Responsive behavior verified
- [x] Documentation updated across all phase files
- [x] AI storage fully transitioned to Convex (Observational Memory)
- [x] Global Navigation Header implemented
- [x] Multi-agent system verified (Copilot + Auditor)
