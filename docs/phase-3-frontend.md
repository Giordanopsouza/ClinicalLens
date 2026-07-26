# Phase 3: Frontend & CopilotKit Integration — The Dashboard

**Owner:** Person 3 (Frontend Engineer)
**Branch:** `phase-3-frontend` (from `main` after Phase 2 merge)
**Time estimate:** ~3-4 hours
**Depends on:** Phase 0 (scaffold + shadcn) + Phase 1 (Convex queries) + Phase 2 (agents + API route)

This phase builds the full dashboard UI: patient list sidebar, patient detail view, lab charts, prescription/diagnosis tables, safety alerts, and the CopilotKit chat panel with Generative UI actions.

---

## 3.1 Layout Architecture

The app uses a **three-panel layout**:

```
┌──────────────────────────────────────────────────────────────────┐
│  Header (logo, theme toggle, project title)                      │
├──────────────┬───────────────────────────┬───────────────────────┤
│              │                           │                       │
│  Patient     │   Patient Detail          │   CopilotKit          │
│  List        │   (tabs: Summary, Labs,   │   Chat Sidebar        │
│  Sidebar     │    Prescriptions,         │                       │
│  (~250px)    │    Diagnoses, Safety)      │   (~380px)            │
│              │                           │                       │
│  - Search    │                           │   - Chat messages     │
│  - Filter    │                           │   - Generative UI     │
│  - Cards     │                           │   - Actions           │
│              │                           │                       │
├──────────────┴───────────────────────────┴───────────────────────┤
│  Footer (disclaimer: "For research use only")                    │
└──────────────────────────────────────────────────────────────────┘
```

## 3.2 Root Layout with CopilotKit Provider

Update the root layout to include CopilotKit. The CopilotKit provider wraps the entire app so the chat sidebar is available everywhere.

**File: `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { CopilotKitProvider } from "@/components/providers/copilotkit-provider";

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
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <CopilotKitProvider>
              {children}
            </CopilotKitProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**File: `src/components/providers/copilotkit-provider.tsx`**

```tsx
"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { ReactNode } from "react";

// Points to the Mastra-powered API route (or standalone server)
const COPILOTKIT_URL =
  process.env.NEXT_PUBLIC_COPILOTKIT_URL || "/api/copilotkit";

export function CopilotKitProvider({ children }: { children: ReactNode }) {
  return (
    <CopilotKit runtimeUrl={COPILOTKIT_URL} agent="clinicalCopilotAgent">
      {children}
    </CopilotKit>
  );
}
```

> **If using standalone Mastra server:** Set `NEXT_PUBLIC_COPILOTKIT_URL=http://localhost:4111/copilotkit` in `.env.local`.

## 3.3 Global State — Selected Patient Context

Use React context to track which patient is currently selected across all components.

**File: `src/context/patient-context.tsx`**

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

Wrap this in the main page (not layout, since it's page-level state).

## 3.4 Main Dashboard Page

**File: `src/app/page.tsx`**

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
          {/* Left: Patient List */}
          <PatientSidebar />

          {/* Center: Patient Detail */}
          <main className="flex-1 overflow-y-auto border-x border-border">
            <PatientDetail />
          </main>

          {/* Right: CopilotKit Chat */}
          <ClinicalChat />
        </div>
      </div>
    </PatientProvider>
  );
}
```

## 3.5 Header Component

**File: `src/components/layout/header.tsx`**

```tsx
"use client";

import { Activity, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold tracking-tight">
          Project Aegis
        </h1>
        <span className="text-xs text-muted-foreground">
          Clinical Copilot
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
```

## 3.6 Patient Sidebar (Left Panel)

**File: `src/components/patients/patient-sidebar.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { usePatient } from "@/context/patient-context";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function PatientSidebar() {
  const patients = useQuery(api.queries.getPatientList, { limit: 100 });
  const { selectedHadmId, setSelectedHadmId } = usePatient();
  const [search, setSearch] = useState("");

  const filtered = (patients ?? []).filter(
    (p) =>
      p.admission_diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.hadm_id).includes(search) ||
      String(p.subject_id).includes(search)
  );

  return (
    <aside className="flex w-[280px] flex-col border-r border-border bg-card">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {filtered.length} patients
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filtered.map((patient) => (
            <button
              key={patient.hadm_id}
              onClick={() => setSelectedHadmId(patient.hadm_id)}
              className={cn(
                "flex w-full flex-col items-start gap-1 rounded-md p-3 text-left text-sm transition-colors hover:bg-accent",
                selectedHadmId === patient.hadm_id &&
                  "bg-accent border border-primary/20"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">ID: {patient.hadm_id}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {patient.age}y {patient.gender}
                </Badge>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {patient.admission_diagnosis || "No diagnosis recorded"}
              </p>
            </button>
          ))}
          {!patients && (
            <div className="space-y-2 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
```

## 3.7 Patient Detail (Center Panel)

**File: `src/components/patients/patient-detail.tsx`**

```tsx
"use client";

import { usePatient } from "@/context/patient-context";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientSummary } from "./patient-summary";
import { LabsView } from "../labs/labs-view";
import { PrescriptionTable } from "../prescriptions/prescription-table";
import { DiagnosisList } from "../diagnoses/diagnosis-list";
import { FileText, FlaskConical, Pill, Stethoscope } from "lucide-react";

export function PatientDetail() {
  const { selectedHadmId } = usePatient();

  if (!selectedHadmId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-medium text-muted-foreground">
            Select a patient
          </h2>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Choose a patient from the sidebar to view their clinical data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <PatientHeader hadmId={selectedHadmId} />
      <div className="p-4">
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Summary
            </TabsTrigger>
            <TabsTrigger value="labs" className="gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" /> Labs
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="gap-1.5">
              <Pill className="h-3.5 w-3.5" /> Medications
            </TabsTrigger>
            <TabsTrigger value="diagnoses" className="gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" /> Diagnoses
            </TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <PatientSummary hadmId={selectedHadmId} />
          </TabsContent>
          <TabsContent value="labs">
            <LabsView hadmId={selectedHadmId} />
          </TabsContent>
          <TabsContent value="prescriptions">
            <PrescriptionTable hadmId={selectedHadmId} />
          </TabsContent>
          <TabsContent value="diagnoses">
            <DiagnosisList hadmId={selectedHadmId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PatientHeader({ hadmId }: { hadmId: number }) {
  const patient = useQuery(api.queries.getPatientById, { hadm_id: hadmId });

  if (!patient) {
    return <div className="h-20 animate-pulse bg-muted" />;
  }

  return (
    <div className="border-b border-border bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Admission #{patient.hadm_id}
          </h2>
          <p className="text-sm text-muted-foreground">
            Subject {patient.subject_id} &middot; {patient.age} years &middot;{" "}
            {patient.gender}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {patient.admission_diagnosis}
        </Badge>
      </div>
    </div>
  );
}
```

## 3.8 Patient Summary Tab

**File: `src/components/patients/patient-summary.tsx`**

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PatientSummary({ hadmId }: { hadmId: number }) {
  const patient = useQuery(api.queries.getPatientById, { hadm_id: hadmId });

  if (!patient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discharge Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {patient.discharge_summary || "No discharge summary available."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 3.9 Labs View with Charts

**File: `src/components/labs/labs-view.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LabChart } from "./lab-chart";

export function LabsView({ hadmId }: { hadmId: number }) {
  const labTypes = useQuery(api.queries.getLabTypesForAdmission, {
    hadm_id: hadmId,
  });
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  if (!labTypes) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Available Lab Tests ({labTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {labTypes.map((lt) => (
              <Badge
                key={lt.itemid}
                variant={selectedItemId === lt.itemid ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() =>
                  setSelectedItemId(
                    selectedItemId === lt.itemid ? null : lt.itemid
                  )
                }
              >
                {lt.lab_name} ({lt.count})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedItemId && (
        <LabChart hadmId={hadmId} itemid={selectedItemId} />
      )}
    </div>
  );
}
```

**File: `src/components/labs/lab-chart.tsx`**

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LabChartProps {
  hadmId: number;
  itemid: number;
}

export function LabChart({ hadmId, itemid }: LabChartProps) {
  const trend = useQuery(api.queries.getLabTrend, {
    hadm_id: hadmId,
    itemid: itemid,
  });

  if (!trend) {
    return <Skeleton className="h-64 w-full" />;
  }

  const chartData = trend.data.map((d) => ({
    time: new Date(d.charttime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: d.value,
    unit: d.unit,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {trend.lab_name}
          {trend.fluid && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({trend.fluid})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data points available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                label={{
                  value: chartData[0]?.unit || "",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11 },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

## 3.10 Prescription Table

**File: `src/components/prescriptions/prescription-table.tsx`**

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function PrescriptionTable({ hadmId }: { hadmId: number }) {
  const prescriptions = useQuery(api.queries.getPrescriptionsByAdmission, {
    hadm_id: hadmId,
  });

  if (!prescriptions) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Medications ({prescriptions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No prescriptions on record.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((rx, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{rx.drug}</TableCell>
                  <TableCell>
                    {rx.dose_value ?? "—"} {rx.dose_unit ?? ""}
                  </TableCell>
                  <TableCell>{rx.route ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    {rx.startdate
                      ? new Date(rx.startdate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {rx.enddate
                      ? new Date(rx.enddate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
```

## 3.11 Diagnosis List

**File: `src/components/diagnoses/diagnosis-list.tsx`**

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExploreProtocolsButton } from "./explore-protocols-button";

export function DiagnosisList({ hadmId }: { hadmId: number }) {
  const diagnoses = useQuery(api.queries.getDiagnosesByAdmission, {
    hadm_id: hadmId,
  });

  if (!diagnoses) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Diagnoses ({diagnoses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {diagnoses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No diagnoses on record.</p>
        ) : (
          <div className="space-y-3">
            {diagnoses.map((dx, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-2 rounded-md border border-border p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {dx.icd9_code}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      #{dx.seq_num}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{dx.short_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {dx.long_title}
                  </p>
                </div>
                <ExploreProtocolsButton
                  icd9Code={dx.icd9_code}
                  diagnosisTitle={dx.short_title}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**File: `src/components/diagnoses/explore-protocols-button.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";
import { useCopilotAction } from "@copilotkit/react-core";

interface ExploreProtocolsButtonProps {
  icd9Code: string;
  diagnosisTitle: string;
}

export function ExploreProtocolsButton({
  icd9Code,
  diagnosisTitle,
}: ExploreProtocolsButtonProps) {
  const [loading, setLoading] = useState(false);

  // This triggers the CopilotKit chat to search for guidelines
  // The agent will use the tavilyResearchTool automatically
  const handleExplore = () => {
    setLoading(true);
    // Dispatch a message to the copilot chat
    // The actual implementation depends on CopilotKit's message API
    // For now, we use window.dispatchEvent as a bridge
    window.dispatchEvent(
      new CustomEvent("copilot-explore", {
        detail: {
          message: `Search for the latest 2026 clinical guidelines and treatment protocols for ICD-9 code ${icd9Code} (${diagnosisTitle}). Include any relevant clinical trials or FDA updates.`,
        },
      })
    );
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExplore}
      disabled={loading}
      className="shrink-0"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ExternalLink className="h-3.5 w-3.5" />
      )}
      <span className="ml-1 text-xs">Explore</span>
    </Button>
  );
}
```

## 3.12 CopilotKit Chat Panel with Generative UI

**File: `src/components/chat/clinical-chat.tsx`**

```tsx
"use client";

import { useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { usePatient } from "@/context/patient-context";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LabChartCard } from "./generative-ui/lab-chart-card";
import { SafetyAlertCard } from "./generative-ui/safety-alert-card";
import { GuidelineCard } from "./generative-ui/guideline-card";

export function ClinicalChat() {
  const { selectedHadmId } = usePatient();
  const patient = useQuery(
    api.queries.getPatientById,
    selectedHadmId ? { hadm_id: selectedHadmId } : "skip"
  );

  // ─── Pass patient context to the agent automatically ───────────
  useCopilotReadable({
    description: "Currently selected patient information",
    value: patient
      ? {
          hadm_id: patient.hadm_id,
          subject_id: patient.subject_id,
          age: patient.age,
          gender: patient.gender,
          admission_diagnosis: patient.admission_diagnosis,
          discharge_summary_preview: patient.discharge_summary?.slice(0, 1000),
        }
      : "No patient selected. Ask the user to select a patient from the sidebar.",
  });

  // ─── Generative UI: Render Lab Chart in Chat ───────────────────
  useCopilotAction({
    name: "renderLabChart",
    description:
      "Render an interactive lab chart inside the chat. Use this when the user asks to see or visualize lab trends.",
    parameters: [
      {
        name: "hadmId",
        type: "number",
        description: "Hospital admission ID",
        required: true,
      },
      {
        name: "itemid",
        type: "number",
        description: "Lab item ID to chart",
        required: true,
      },
      {
        name: "labName",
        type: "string",
        description: "Human-readable lab name",
        required: true,
      },
    ],
    render: ({ args }) => (
      <LabChartCard
        hadmId={args.hadmId}
        itemid={args.itemid}
        labName={args.labName}
      />
    ),
  });

  // ─── Generative UI: Render Safety Alert ────────────────────────
  useCopilotAction({
    name: "renderSafetyAlert",
    description:
      "Render a safety alert card showing prescription-diagnosis mismatches. Use after running the safety check.",
    parameters: [
      {
        name: "hadmId",
        type: "number",
        description: "Hospital admission ID",
        required: true,
      },
      {
        name: "flags",
        type: "object[]",
        description: "Array of safety flags with drug, issue, and severity",
        required: true,
      },
      {
        name: "summary",
        type: "string",
        description: "Summary of the safety check",
        required: true,
      },
    ],
    render: ({ args }) => (
      <SafetyAlertCard
        hadmId={args.hadmId}
        flags={args.flags as any}
        summary={args.summary}
      />
    ),
  });

  // ─── Generative UI: Render Guideline Results ───────────────────
  useCopilotAction({
    name: "renderGuidelines",
    description:
      "Render guideline search results as cards. Use after searching for clinical guidelines via Tavily.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The search query used",
        required: true,
      },
      {
        name: "results",
        type: "object[]",
        description: "Array of results with title, url, content, and score",
        required: true,
      },
      {
        name: "answer",
        type: "string",
        description: "Synthesized answer from Tavily",
        required: false,
      },
    ],
    render: ({ args }) => (
      <GuidelineCard
        query={args.query}
        results={args.results as any}
        answer={args.answer}
      />
    ),
  });

  // ─── Listen for "Explore Protocols" button events ──────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // CopilotKit should pick this up as a user message
      // Implementation depends on CopilotKit's programmatic message API
      console.log("Explore event:", detail.message);
    };
    window.addEventListener("copilot-explore", handler);
    return () => window.removeEventListener("copilot-explore", handler);
  }, []);

  return (
    <aside className="w-[380px] border-l border-border">
      <CopilotChat
        labels={{
          title: "Clinical Copilot",
          initial:
            "Hi! I'm your clinical copilot. Select a patient from the sidebar and ask me anything about their case — labs, medications, diagnoses, or explore treatment guidelines.",
          placeholder: "Ask about the patient...",
        }}
        className="h-full"
      />
    </aside>
  );
}
```

## 3.13 Generative UI Card Components

These render inside the CopilotKit chat as rich interactive elements.

**File: `src/components/chat/generative-ui/lab-chart-card.tsx`**

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FlaskConical } from "lucide-react";

interface LabChartCardProps {
  hadmId: number;
  itemid: number;
  labName: string;
}

export function LabChartCard({ hadmId, itemid, labName }: LabChartCardProps) {
  const trend = useQuery(api.queries.getLabTrend, {
    hadm_id: hadmId,
    itemid: itemid,
  });

  const chartData = (trend?.data || []).map((d) => ({
    time: new Date(d.charttime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: d.value,
  }));

  return (
    <Card className="my-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <FlaskConical className="h-4 w-4 text-primary" />
          {labName} — Admission #{hadmId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-xs text-muted-foreground">Loading chart data...</p>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

**File: `src/components/chat/generative-ui/safety-alert-card.tsx`**

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";

interface SafetyFlag {
  drug: string;
  issue: string;
  severity: "info" | "warning" | "critical";
}

interface SafetyAlertCardProps {
  hadmId: number;
  flags: SafetyFlag[];
  summary: string;
}

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
    badge: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    badge: "secondary" as const,
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    badge: "outline" as const,
  },
};

export function SafetyAlertCard({
  hadmId,
  flags,
  summary,
}: SafetyAlertCardProps) {
  return (
    <Card className="my-2 border-yellow-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldAlert className="h-4 w-4 text-yellow-500" />
          Safety Audit — Admission #{hadmId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{summary}</p>
        {flags.map((flag, i) => {
          const config = severityConfig[flag.severity];
          const Icon = config.icon;
          return (
            <Alert key={i} className={config.bg}>
              <Icon className={`h-4 w-4 ${config.color}`} />
              <AlertDescription className="ml-2">
                <div className="flex items-center gap-2">
                  <Badge variant={config.badge} className="text-xs">
                    {flag.drug}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {flag.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-xs">{flag.issue}</p>
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

**File: `src/components/chat/generative-ui/guideline-card.tsx`**

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";

interface GuidelineResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface GuidelineCardProps {
  query: string;
  results: GuidelineResult[];
  answer?: string;
}

export function GuidelineCard({ query, results, answer }: GuidelineCardProps) {
  return (
    <Card className="my-2 border-blue-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-blue-500" />
          Guideline Search Results
        </CardTitle>
        <p className="text-xs text-muted-foreground italic">"{query}"</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {answer && (
          <div className="rounded-md bg-blue-500/5 p-3">
            <p className="text-xs font-medium text-blue-400">AI Summary</p>
            <p className="mt-1 text-sm">{answer}</p>
          </div>
        )}
        {results.map((r, i) => (
          <div key={i} className="rounded-md border border-border p-2.5">
            <div className="flex items-start justify-between gap-2">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                {r.title}
                <ExternalLink className="ml-1 inline h-3 w-3" />
              </a>
              <Badge variant="outline" className="shrink-0 text-xs">
                {(r.score * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
              {r.content}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## 3.14 Custom CopilotKit CSS Overrides

Add styling to make CopilotKit match the dark theme. Append to your global styles:

**File: `src/app/globals.css`** (append these styles)

```css
/* ─── CopilotKit Theme Overrides ──────────────────────────────── */
.copilotKitChat {
  --copilot-kit-primary-color: hsl(var(--primary));
  --copilot-kit-background-color: hsl(var(--card));
  --copilot-kit-secondary-color: hsl(var(--secondary));
  --copilot-kit-separator-color: hsl(var(--border));
  --copilot-kit-response-button-background-color: hsl(var(--accent));
  --copilot-kit-response-button-color: hsl(var(--accent-foreground));
  height: 100% !important;
}
```

## 3.15 File Structure After Phase 3

```
src/
├── app/
│   ├── layout.tsx                           # Updated with CopilotKit provider
│   ├── page.tsx                             # Main dashboard page
│   ├── globals.css                          # + CopilotKit theme overrides
│   └── api/copilotkit/route.ts              # From Phase 2
├── components/
│   ├── providers/
│   │   ├── convex-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── copilotkit-provider.tsx          # ✅ New
│   ├── layout/
│   │   └── header.tsx                       # ✅ New
│   ├── patients/
│   │   ├── patient-sidebar.tsx              # ✅ New
│   │   ├── patient-detail.tsx               # ✅ New
│   │   └── patient-summary.tsx              # ✅ New
│   ├── labs/
│   │   ├── labs-view.tsx                    # ✅ New
│   │   └── lab-chart.tsx                    # ✅ New (Recharts)
│   ├── prescriptions/
│   │   └── prescription-table.tsx           # ✅ New
│   ├── diagnoses/
│   │   ├── diagnosis-list.tsx               # ✅ New
│   │   └── explore-protocols-button.tsx     # ✅ New
│   ├── chat/
│   │   ├── clinical-chat.tsx                # ✅ New (CopilotKit + actions)
│   │   └── generative-ui/
│   │       ├── lab-chart-card.tsx            # ✅ New (renders in chat)
│   │       ├── safety-alert-card.tsx         # ✅ New (renders in chat)
│   │       └── guideline-card.tsx            # ✅ New (renders in chat)
│   └── ui/                                  # shadcn components (from Phase 0)
└── context/
    └── patient-context.tsx                  # ✅ New
```

---

## PR Checklist — Phase 3

- [ ] `pnpm dev` starts and renders the dashboard without errors
- [ ] Patient sidebar loads and displays patient list from Convex
- [ ] Clicking a patient shows their detail view with all 4 tabs
- [ ] **Summary tab**: Discharge summary renders as readable text
- [ ] **Labs tab**: Lab types load as badges; clicking one shows a Recharts line chart
- [ ] **Medications tab**: Prescription table renders with all columns
- [ ] **Diagnoses tab**: ICD-9 codes display with titles; Explore button is present
- [ ] CopilotKit chat panel renders on the right side
- [ ] `useCopilotReadable` passes selected patient context to the agent
- [ ] Chat messages show — agent can respond about the selected patient
- [ ] Generative UI actions defined: `renderLabChart`, `renderSafetyAlert`, `renderGuidelines`
- [ ] Dark/light mode toggle works
- [ ] No layout overflow — all panels scroll independently
- [ ] Loading skeletons show while data is fetching
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)

## Troubleshooting

| Issue | Solution |
|---|---|
| CopilotKit chat not connecting | Check if Mastra server is running; verify `runtimeUrl` matches |
| Convex queries return undefined | Ensure `convex dev` is running; check table names match schema |
| Recharts not rendering | Ensure component is `"use client"`; check data format (needs `value` as number) |
| Theme flicker on load | Add `suppressHydrationWarning` to `<html>` tag |
| Generative UI not rendering in chat | Verify `useCopilotAction` parameter types match what the agent sends |
| Patient context not updating in chat | Ensure `useCopilotReadable` re-runs when `selectedHadmId` changes |
