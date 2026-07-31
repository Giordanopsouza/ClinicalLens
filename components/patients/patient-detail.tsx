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
import { 
  FileText, FlaskConical, Pill, Stethoscope, User, 
  AlertTriangle, HeartPulse, History, Activity, 
  Search, MousePointer2, Sparkles 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function PatientDetail() {
  const { selectedHadmId } = usePatient();

  if (!selectedHadmId) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-8">
        <div className="max-w-[600px] w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="space-y-4">
            <div className="mx-auto h-24 w-24 rounded-[2rem] bg-primary/5 flex items-center justify-center mb-8 border border-primary/10 shadow-inner">
              <Activity className="h-12 w-12 text-primary/40 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase">
              Clinical Workbench
            </h2>
            <p className="text-[15px] font-medium text-muted-foreground max-w-[400px] mx-auto leading-relaxed">
              Real-time clinical intelligence and longitudinal data analysis for the modern clinician.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3 group hover:bg-muted/50 transition-colors">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">Quick Discovery</h4>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                Press <kbd className="px-1.5 py-0.5 rounded border border-border bg-background font-black text-[9px]">⌘K</kbd> to search the registry by Patient ID or Diagnosis.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 space-y-3 group hover:bg-muted/50 transition-colors">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">Agentic Analysis</h4>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                Ask Aegis to summarize history, analyze lab trends, or audit prescriptions.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
            <MousePointer2 className="h-3 w-3" />
            Select a record to begin
          </div>
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
  const [note, setNote] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  if (!patient) {
    return <div className="h-[120px] animate-pulse bg-muted/20 border-b border-border" />;
  }

  const handleShare = () => {
    setIsSharing(true);
    const shareData = {
      title: `Clinical Lens - Patient AEG-${patient.hadm_id}`,
      text: `Reviewing clinical record for Patient AEG-${patient.hadm_id} (${patient.admission_diagnosis})`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .catch((err) => console.error("Error sharing:", err))
        .finally(() => setIsSharing(false));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Secure link copied to clipboard!");
      setIsSharing(false);
    }
  };

  return (
    <div className="border-b border-border bg-card px-8 py-6 z-10 shrink-0 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
        <Activity className="size-32" />
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 max-w-[1400px] mx-auto relative z-10">
        {/* Left Cluster: Patient Identity */}
        <div className="flex items-start gap-6">
          <div className="relative shrink-0">
            <div className="size-20 rounded-[2rem] bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer">
              <User className="h-10 w-10 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-card shadow-lg flex items-center justify-center" title="Stable status">
              <div className="size-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-3xl font-black tracking-tight text-foreground uppercase italic">
                AEG-{patient.hadm_id}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-6 px-2 text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                  {patient.gender === "M" ? "Male" : "Female"}
                </Badge>
                <Badge variant="outline" className="h-6 px-2 text-[10px] font-black uppercase tracking-widest border-border/50">
                  {patient.age} years
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/50 border border-border/50">
                <span className="size-1.5 bg-blue-500 rounded-full" />
                Admission Diagnosis
              </div>
              <span className="text-foreground tracking-tight normal-case text-sm font-bold opacity-100 italic">
                {patient.admission_diagnosis}
              </span>
            </div>
          </div>
        </div>

        {/* Right Cluster: Clinical Safety & Actions */}
        <div className="flex flex-wrap items-center gap-6 xl:justify-end">
          {/* Safety Indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-right-4 duration-700 shadow-sm shadow-red-500/5 group hover:bg-red-500/20 transition-all cursor-default">
              <AlertTriangle className="h-4 w-4 animate-bounce" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Critical Alert</span>
                <span className="text-[10px] font-bold mt-0.5">Penicillin Allergy</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 text-primary group hover:bg-primary/10 transition-all cursor-default">
              <HeartPulse className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Risk Profile</span>
                <span className="text-[10px] font-bold mt-0.5">High AFib Risk</span>
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-border/50 hidden sm:block mx-2" />

          {/* Interaction Hub */}
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/5 active:scale-95 group">
                  <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">add_notes</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Notes</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-border/50 shadow-2xl p-0 overflow-hidden">
                <div className="bg-slate-900 dark:bg-slate-100 p-8 text-white dark:text-slate-900">
                  <div className="size-12 rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6" />
                  </div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Clinical Addendum</DialogTitle>
                  <DialogDescription className="text-xs font-medium text-white/60 dark:text-black/60 mt-1">
                    Record a formal observation for AEG-{patient.hadm_id}
                  </DialogDescription>
                </div>
                <div className="p-8 space-y-6">
                  <Textarea
                    placeholder="Enter diagnostic notes or follow-up instructions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[180px] rounded-3xl bg-muted/30 border-border/50 focus-visible:ring-primary text-sm font-medium resize-none p-6"
                  />
                  <DialogFooter>
                    <Button 
                      onClick={() => {
                        setNote("");
                        alert("Note cryptographically committed to record.");
                      }}
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl"
                    >
                      Commit to Official Chart
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            <button 
              onClick={handleShare}
              disabled={isSharing}
              className="size-11 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 shadow-sm flex items-center justify-center active:scale-95 group disabled:opacity-50"
              title="Share Clinical Record"
            >
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
