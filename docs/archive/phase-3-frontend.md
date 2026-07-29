# Phase 3: Frontend & CopilotKit Integration — The Dashboard

**Status:** 100% Complete (16/16 Tasks)
**Owner:** Person 3 (Frontend Engineer)
**Branch:** `phase-3-frontend` (from `main` after Phase 2 merge)
**Time estimate:** ~3-4 hours
**Depends on:** Phase 0 (scaffold + shadcn) + Phase 1 (Convex queries) + Phase 2 (agents + API route)

This phase builds the full dashboard UI: patient list sidebar, patient detail view, lab charts, prescription/diagnosis tables, safety alerts, and the CopilotKit chat panel with Generative UI actions.

---

## 3.1 Install Frontend Dependencies

```bash
pnpm add @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime @ag-ui/mastra recharts lucide-react clsx tailwind-merge
```

## 3.2 Global Layout & Providers

Wrap the application in `CopilotKitProvider`.

**File: `components/providers/copilotkit-provider.tsx`**

```tsx
"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { ReactNode } from "react";

const COPILOTKIT_URL = process.env.NEXT_PUBLIC_COPILOTKIT_URL || "/api/copilotkit";

export function CopilotKitProvider({ children }: { children: ReactNode }) {
  return (
    <CopilotKit runtimeUrl={COPILOTKIT_URL} agent="clinicalCopilotAgent">
      {children}
    </CopilotKit>
  );
}
```

## 3.3 Patient Context

Manage the selected patient state across the dashboard.

**File: `context/patient-context.tsx`**

```tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PatientContextType {
  selectedHadmId: number | null;
  setSelectedHadmId: (id: number | null) => void;
}

const PatientContext = createContext<PatientContextType>({
  selectedHadmId: null,
  setSelectedHadmId: () => {},
});

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedHadmId, setSelectedHadmId] = useState<number | null>(null);

  return (
    <PatientContext.Provider value={{ selectedHadmId, setSelectedHadmId }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  return useContext(PatientContext);
}
```

## 3.4 Dashboard Page Layout

The dashboard uses a 3-column layout: Sidebar (List) | Main (Detail) | Sidebar (Chat).

**File: `app/dashboard/page.tsx`**

```tsx
"use client";

import { PatientProvider } from "@/context/patient-context";
import { Header } from "@/components/layout/header";
import { PatientSidebar } from "@/components/patients/patient-sidebar";
import { PatientDetail } from "@/components/patients/patient-detail";
import { ClinicalChat } from "@/components/chat/clinical-chat";

export default function DashboardPage() {
  return (
    <PatientProvider>
      <div className="flex h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <PatientSidebar />
          <main className="flex-1 overflow-y-auto border-x border-border">
            <PatientDetail />
          </main>
          <ClinicalChat />
        </div>
      </div>
    </PatientProvider>
  );
}
```

## 3.5 Patient Sidebar (List View)

**File: `components/patients/patient-sidebar.tsx`**

Fetches the list of clinical cases from Convex and allows selection. Uses Shadcn `ScrollArea` and `Badge`.

## 3.6 Patient Detail (Tabbed View)

**File: `components/patients/patient-detail.tsx`**

Uses Shadcn `Tabs` to organize:
1. **Summary**: Clinical narrative and discharge summary.
2. **Labs**: Visual trends and lab results.
3. **Medications**: Current prescription table.
4. **Diagnoses**: ICD-9 codes and AI research buttons.

## 3.7 Lab Trend Visualization

**File: `components/labs/lab-chart.tsx`**

Uses `recharts` to render a responsive `LineChart` for any selected laboratory measurement.

## 3.8 Generative UI: Clinical Chat

**File: `components/chat/clinical-chat.tsx`**

Integrates `CopilotChat` and defines actions that the agent can trigger to render UI cards:
- `renderLabChart`: Shows a trend chart in the chat.
- `renderSafetyAlert`: Displays prescription mismatches.
- `renderGuidelines`: Shows clinical research results.

## 3.14 Advanced Dashboard Features (Inspiration-driven)

Based on clinical design best practices from Aegis Dashboard inspiration, we are adding the following:

### 3.14.1 Clinical Narrative Card
A high-level summary of the patient's current condition and trajectory, located at the top of the Summary tab. Includes hashtag-style clinical markers (e.g., #CHF, #AKI).

### 3.14.2 Longitudinal Timeline
A vertical timeline of all patient events (admissions, lab results, medication changes) to provide a historical perspective.

### 3.14.3 Priority Alert Center
A dedicated view for clinical safety alerts and reconciliation tasks, categorized by severity (Critical, Warning, Info).

### 3.14.4 Vitals & Trend Sparklines
Inline mini-charts for rapid assessment of patient stability across key metrics (BPM, SpO2, BP) using Recharts Sparklines.

## 3.15 Implementation Checklist

- [x] `pnpm dev` starts and renders the dashboard without errors
- [x] Patient sidebar loads and displays patient list from Convex
- [x] Clicking a patient shows their detail view with all 4 tabs
- [x] **Summary tab**: Discharge summary renders as readable text
- [x] **Labs tab**: Lab types load as badges; clicking one shows a Recharts line chart
- [x] **Medications tab**: Prescription table renders with all columns
- [x] **Diagnoses tab**: ICD-9 codes display with titles; Explore button is present
- [x] CopilotKit chat panel renders on the right side
- [x] `useCopilotReadable` passes selected patient context to the agent
- [x] Chat messages show — agent can respond about the selected patient
- [x] Generative UI actions defined: `renderLabChart`, `renderSafetyAlert`, `renderGuidelines`
- [x] Dark/light mode toggle works
- [x] No layout overflow — all panels scroll independently
- [x] Loading skeletons show while data is fetching
- [x] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] **NEW**: Vertical Timeline component for patient history
- [ ] **NEW**: Sparkline micro-charts for vitals
- [ ] **NEW**: Alert Center reconciliation view
- [ ] **NEW**: Enhanced Patient Header with profile photo and status badge

## Troubleshooting

| Issue | Solution |
|---|---|
| CopilotKit chat not connecting | Check if Mastra server is running; verify `runtimeUrl` matches |
| Convex queries return undefined | Ensure `convex dev` is running; check table names match schema |
| Recharts not rendering | Ensure component is `"use client"`; check data format (needs `value` as number) |
| Theme flicker on load | Add `suppressHydrationWarning` to `<html>` tag |
| Generative UI not rendering in chat | Verify `useCopilotAction` parameter types match what the agent sends |
| Patient context not updating in chat | Ensure `useCopilotReadable` re-runs when `selectedHadmId` changes |
