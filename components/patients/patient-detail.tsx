"use client";

import { usePatient } from "@/context/patient-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PatientSummary } from "./patient-summary";
import { LabsView } from "../labs/labs-view";
import { PrescriptionTable } from "../prescriptions/prescription-table";
import { DiagnosisList } from "../diagnoses/diagnosis-list";
import { LongitudinalRecord } from "./longitudinal-record";
import { FileText, FlaskConical, Pill, Stethoscope, User, AlertTriangle, HeartPulse, History, Activity } from "lucide-react";

export function PatientDetail() {
  const { selectedHadmId } = usePatient();

  if (!selectedHadmId) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="mx-auto h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
            <Activity className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
            Clinical Patient Workbench
          </h2>
          <p className="text-[15px] font-medium text-muted-foreground max-w-[340px] mx-auto leading-relaxed">
            Select a patient from the registry to begin clinical analysis and agentic decision support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PatientHeader hadmId={selectedHadmId} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5 custom-scrollbar">
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-muted/50 p-1 text-muted-foreground border border-border/50">
            <TabsTrigger value="summary" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2 uppercase tracking-wider">
              <FileText className="h-3.5 w-3.5" /> Summary
            </TabsTrigger>
            <TabsTrigger value="timeline" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2 uppercase tracking-wider">
              <History className="h-3.5 w-3.5" /> Timeline
            </TabsTrigger>
            <TabsTrigger value="labs" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2 uppercase tracking-wider">
              <FlaskConical className="h-3.5 w-3.5" /> Labs
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2 uppercase tracking-wider">
              <Pill className="h-3.5 w-3.5" /> Medications
            </TabsTrigger>
            <TabsTrigger value="diagnoses" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm gap-2 uppercase tracking-wider">
              <Stethoscope className="h-3.5 w-3.5" /> Diagnoses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="focus-visible:outline-none animate-in fade-in duration-300">
            <PatientSummary hadmId={selectedHadmId} />
          </TabsContent>
          <TabsContent value="timeline" className="focus-visible:outline-none animate-in fade-in duration-300">
            <LongitudinalRecord />
          </TabsContent>
          <TabsContent value="labs" className="focus-visible:outline-none animate-in fade-in duration-300">
            <LabsView hadmId={selectedHadmId} />
          </TabsContent>
          <TabsContent value="prescriptions" className="focus-visible:outline-none animate-in fade-in duration-300">
            <PrescriptionTable hadmId={selectedHadmId} />
          </TabsContent>
          <TabsContent value="diagnoses" className="focus-visible:outline-none animate-in fade-in duration-300">
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
    return <div className="h-[120px] animate-pulse bg-muted/20 border-b border-border" />;
  }

  return (
    <div className="border-b border-border bg-card px-8 py-6 shadow-sm z-10 shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner overflow-hidden group hover:bg-primary/20 transition-all duration-300 cursor-pointer">
              <User className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-card ring-1 ring-emerald-500/20" title="Stable status" />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black tracking-tight text-foreground">
                Patient #{patient.hadm_id}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-muted text-[10px] font-black font-mono text-muted-foreground uppercase tracking-widest border border-border/50 shadow-sm">
                #AEG-{patient.hadm_id}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Badge variant="outline" className="h-5 px-1.5 py-0 rounded text-[10px]">{patient.age}y</Badge></span>
              <span className="size-1 bg-muted-foreground/30 rounded-full" />
              <span>{patient.gender === "M" ? "Male" : "Female"}</span>
              <span className="size-1 bg-muted-foreground/30 rounded-full" />
              <span className="flex items-center gap-1 text-primary/80"><span className="material-symbols-outlined text-sm">emergency</span> Admission Diagnosis: <strong className="text-foreground ml-1">{patient.admission_diagnosis}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4 duration-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Safety Alert: Penicillin
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            <HeartPulse className="h-3.5 w-3.5" />
            AFib Risk
          </div>
          <div className="h-8 w-px bg-border/50 mx-1 hidden sm:block" />
          <div className="flex gap-2">
            <button className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-lg leading-none">add_notes</span>
            </button>
            <button className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 shadow-sm active:scale-95">
              <span className="material-symbols-outlined text-lg leading-none">share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
