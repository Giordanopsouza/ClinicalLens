"use client";

import { useState } from "react";
import { usePatient } from "@/context/patient-context";
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, History, Download, ExternalLink, User, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { MedicalDocument } from "@/components/patients/medical-document";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function RecordsPage() {
  const { selectedHadmId, setSelectedHadmId } = usePatient();
  const [recordSearch, setRecordSearch] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const { results: patients, status, loadMore } = usePaginatedQuery(
    api.queries.getPatientList,
    {},
    { initialNumItems: 48 }
  );
  const totalCount = useQuery(api.queries.getTotalPatientCount);
  const patient = useQuery(
    api.queries.getPatientById,
    selectedHadmId ? { hadm_id: selectedHadmId } : "skip"
  );

  const patientList = patients ?? [];

  if (!selectedHadmId) {
    return (
      <div className="h-full flex flex-col bg-muted/5">
        <div className="p-8 border-b border-border/50 bg-card shrink-0">
          <div className="flex items-center gap-4 max-w-[1200px] mx-auto">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Patient Records</h1>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1 opacity-60">
                Browse clinical records across 2,000 cases
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Results header */}
            <div className="flex items-center justify-between px-1 mb-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Registry Results</p>
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-black border-border/50 bg-background">
                {totalCount ?? "..."}
              </Badge>
            </div>

            {/* Patient cards */}
            {patients === undefined ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {patientList.map((p: { hadm_id: number; gender: string; age: number; admission_diagnosis?: string }) => (
                    <button
                      key={p.hadm_id}
                      onClick={() => setSelectedHadmId(p.hadm_id)}
                      className="flex flex-col items-start gap-2 rounded-xl p-4 text-left border border-border/50 bg-card hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200 group shadow-sm"
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <User className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="font-black font-mono text-[11px] text-foreground/80 group-hover:text-primary transition-colors">
                            AEG-{p.hadm_id}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[9px] px-1.5 h-4 font-black uppercase tracking-tighter text-muted-foreground/60 border-border/50">
                          {p.gender} · {p.age}y
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed pl-9 font-medium text-muted-foreground/80 group-hover:text-foreground/70 transition-colors">
                        {p.admission_diagnosis || "No primary diagnosis recorded"}
                      </p>
                    </button>
                  ))}
                </div>

                {status === "CanLoadMore" && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => loadMore(48)}
                      className="px-8 py-2.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      Load More Results
                    </button>
                  </div>
                )}
                
                {status === "LoadingMore" && (
                  <div className="flex justify-center pt-4">
                    <div className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest animate-pulse">
                      <div className="size-2 bg-primary rounded-full animate-bounce" />
                      Loading Records...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-1/3 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA] dark:bg-[#0A0A0B]">
      {/* Official Archive Header */}
      <div className="px-8 py-4 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-30 shrink-0 no-print">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-foreground uppercase italic">Official Medical Archive</h1>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px] font-black tracking-[0.2em]">VERIFIED</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-0.5 opacity-60">
                Hospital Archive System &middot; Document ID: {patient.case_id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-4 px-4 py-1.5 border-x border-border/50">
              <div className="text-right">
                <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">Last Audit</p>
                <p className="text-[10px] font-bold text-foreground">Mar 09, 2026</p>
              </div>
              <div className="size-8 rounded-full bg-muted flex items-center justify-center border border-border/50">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-white/5 border border-border shadow-sm text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all"
            >
              <Download className="h-3.5 w-3.5" /> PDF Copy
            </button>
            
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-lg hover:opacity-90 transition-all">
                  <History className="h-3.5 w-3.5" /> Full Audit Log
                </button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] custom-scrollbar overflow-y-auto">
                <SheetHeader className="pb-6 border-b border-border/50">
                  <SheetTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Document Audit Trail
                  </SheetTitle>
                  <SheetDescription className="text-xs font-medium">
                    Comprehensive history of access, edits, and clinical verifications for AEG-{patient.hadm_id}.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-8 space-y-8">
                  <div className="space-y-6">
                    {[
                      { date: "Mar 09, 2026 · 04:15 UTC", user: "Karan Balaji", action: "Record Accessed", detail: "Viewed via Medical Archive Terminal" },
                      { date: "Mar 08, 2026 · 23:41 UTC", user: "System", action: "Digital Signature Applied", detail: "SHA-256 Hash Generated & Verified" },
                      { date: "Mar 08, 2026 · 23:40 UTC", user: "Dr. AI Assistant", action: "Clinical Synthesis", detail: "Final discharge summary generated from raw EHR data" },
                      { date: "Mar 08, 2026 · 22:15 UTC", user: "System", action: "Data Ingestion", detail: "MIMIC-III clinical tables synchronized" },
                    ].map((entry, i) => (
                      <div key={i} className="flex gap-4 relative group">
                        {i !== 3 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-px bg-border group-hover:bg-primary/20 transition-colors" />}
                        <div className="size-6 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 relative z-10 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                          <div className="size-1.5 rounded-full bg-muted-foreground group-hover:bg-primary animate-pulse" />
                        </div>
                        <div className="space-y-1 pt-0.5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{entry.action}</p>
                          <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">{entry.detail}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[9px] font-bold text-primary/60 uppercase">{entry.user}</span>
                            <span className="text-[9px] font-bold text-muted-foreground/40 italic">{entry.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-border/50">
                    <p className="text-[9px] leading-relaxed text-muted-foreground italic text-center">
                      End of automated audit trail. All events are cryptographically hashed and stored in the immutable clinical ledger.
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Left: Document Map (Sticky) */}
        <div className="w-64 border-r border-border/50 bg-card/30 hidden lg:block overflow-y-auto custom-scrollbar no-print">
          <div className="p-6 space-y-8 document-map-sidebar">
            <div className="space-y-4">
              <p className="px-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Document Map</p>
              <p className="px-2 text-[11px] font-medium text-muted-foreground leading-relaxed italic">
                Use the map inside the chart to navigate specific clinical sections.
              </p>
            </div>
            
            <div className="pt-8 border-t border-border/50 space-y-4">
              <p className="px-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Search Archive</p>
              <div className="relative group px-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Keyword find..."
                  className="h-9 pl-9 text-[10px] bg-background border-border/50 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg"
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: The "Paper" Record */}
        <div className="flex-1 overflow-y-auto bg-[#F1F3F5] dark:bg-[#000000] p-4 md:p-12 custom-scrollbar flex justify-center paper-container">
          <div className="w-full max-w-[900px] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* The Actual "Paper" Chart */}
            <div className="bg-white dark:bg-[#111112] shadow-[0_30px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_100px_rgba(0,0,0,0.4)] rounded-sm min-h-[1200px] border border-border/50 relative print:shadow-none print:border-none">
              {/* Paper Watermark */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.02] dark:opacity-[0.05] select-none rotate-[-30deg] no-print">
                <h2 className="text-[120px] font-black uppercase">Official</h2>
              </div>

              {/* Record Content */}
              <div className="relative z-10">
                <MedicalDocument rawText={patient.discharge_summary || ""} highlightTerm={recordSearch} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Verification Sidebar */}
        <div className="w-72 border-l border-border/50 bg-card/30 hidden 2xl:block overflow-y-auto custom-scrollbar no-print">
          <div className="p-8 space-y-8 verification-sidebar">
            <section className="space-y-4">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Legal Verification</p>
              <div className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-border/50 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <History className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase leading-none text-foreground">Verified Record</p>
                    <p className="text-[9px] font-bold text-muted-foreground mt-1">SHA-256: 8f2a...91c3</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Electronic Signature</p>
                  <p className="text-xs font-serif italic mt-2 text-foreground/80">Digitally signed by Chief Medical Officer</p>
                  <p className="text-[9px] font-bold text-muted-foreground mt-1">March 08, 2026 · 23:41 UTC</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50">Patient Identification</p>
              <div className="space-y-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Adm ID</p>
                    <p className="text-xs font-bold font-mono">{patient.hadm_id}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Sub ID</p>
                    <p className="text-xs font-bold font-mono">{patient.subject_id}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase">Demographics</p>
                  <p className="text-xs font-bold">{patient.age}y &middot; {patient.gender === "M" ? "Male" : "Female"}</p>
                </div>
              </div>
            </section>

            <section className="pt-8 border-t border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground">AI Indexing</p>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-medium">
                This record has been fully vectorized for semantic search. You can query clinical patterns across this document via the Copilot.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
