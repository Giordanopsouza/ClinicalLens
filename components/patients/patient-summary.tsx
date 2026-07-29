"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { History, AlertCircle } from "lucide-react";
import { ClinicalNarrative } from "./clinical-narrative";

export function PatientSummary({ hadmId }: { hadmId: number }) {
  const patient = useQuery(api.queries.getPatientById, { hadm_id: hadmId });

  if (patient === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (patient === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
        <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No patient record found</p>
        <p className="mt-2 text-xs text-muted-foreground/60">The selected Admission ID does not exist in the registry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
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
            Registry Entry: AEG-{patient.hadm_id}
          </span>
        </CardHeader>
        <CardContent className="pt-6 px-8">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {patient.discharge_summary ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/70 font-normal selection:bg-primary/20">
                {patient.discharge_summary}
              </p>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground italic">No discharge summary available for this record.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
