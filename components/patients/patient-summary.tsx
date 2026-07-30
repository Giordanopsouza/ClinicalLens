"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, FileText, Sparkles } from "lucide-react";
import { ClinicalNarrative } from "./clinical-narrative";
import { MedicalDocument } from "./medical-document";

export function PatientSummary({ hadmId }: { hadmId: number }) {
  const patient = useQuery(api.queries.getPatientById, { hadm_id: hadmId });

  if (patient === undefined) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="flex gap-8">
          <Skeleton className="h-96 w-64 rounded-3xl shrink-0" />
          <Skeleton className="h-96 flex-1 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (patient === null) {
    return (
      <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/50 rounded-[3rem] bg-muted/5 max-w-[1200px] mx-auto">
        <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No patient record found</p>
        <p className="mt-2 text-xs text-muted-foreground/60">The selected Admission ID does not exist in the registry.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      {/* Header Info Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground/80">AI Synthesis & Insight</h2>
        </div>
        <ClinicalNarrative summary={patient.discharge_summary || ""} />
      </section>

      {/* Structured Medical Record */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground/80">Structured Medical Chart</h2>
        </div>
        
        {patient.discharge_summary ? (
          <MedicalDocument rawText={patient.discharge_summary} />
        ) : (
          <div className="py-24 text-center border-2 border-dashed border-border/50 rounded-[3rem] bg-muted/5">
            <p className="text-sm text-muted-foreground italic uppercase tracking-widest font-bold opacity-40">No primary discharge summary available</p>
          </div>
        )}
      </section>
    </div>
  );
}
