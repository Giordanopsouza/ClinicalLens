"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, History } from "lucide-react";
import { ClinicalNarrative } from "./clinical-narrative";

export function PatientSummary({ hadmId }: { hadmId: number }) {
  const patient = useQuery(api.queries.getPatientById, { hadm_id: hadmId });

  if (!patient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* AI Clinical Narrative */}
      <ClinicalNarrative summary={patient.discharge_summary || ""} />

      {/* Full Discharge Summary */}
      <Card className="border-border/50 shadow-sm overflow-hidden dark:card-glow">
        <CardHeader className="bg-muted/30 border-b border-border/50 py-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Full Discharge Record
          </CardTitle>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Admission: {new Date().toLocaleDateString()}
          </span>
        </CardHeader>
        <CardContent className="pt-6 px-8">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/70 font-normal selection:bg-primary/20">
              {patient.discharge_summary || "No discharge summary available."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
