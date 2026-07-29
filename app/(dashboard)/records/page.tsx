"use client";

import { useState } from "react";
import { usePatient } from "@/context/patient-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, History, Download, ExternalLink, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { usePaginatedQuery } from "convex/react";

export default function RecordsPage() {
  const { selectedHadmId, setSelectedHadmId } = usePatient();
  const [recordSearch, setRecordSearch] = useState("");

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

  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col bg-muted/5">
      <div className="p-8 border-b border-border/50 bg-card shrink-0">
        <div className="flex items-center justify-between gap-4 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Medical Records</h1>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1 opacity-60">
                AEG-{patient.hadm_id} &middot; OFFICIAL CHART
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-colors">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
              <History className="h-3.5 w-3.5" /> View Audit Log
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto space-y-8">
          {/* Record Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search terms in this patient's record..."
              className="h-14 pl-12 bg-card border-border/50 text-base rounded-2xl shadow-sm focus-visible:ring-1 focus-visible:ring-primary transition-all"
              value={recordSearch}
              onChange={(e) => setRecordSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Record Column */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-border/50 shadow-sm overflow-hidden dark:card-glow">
                <CardHeader className="bg-muted/30 border-b border-border/50 py-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Final Discharge Summary
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px] font-black border-border/50">VERIFIED</Badge>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80 font-normal selection:bg-primary/20">
                      {highlightText(patient.discharge_summary || "No discharge summary available.", recordSearch)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Side Meta Column */}
            <div className="space-y-6">
              <Card className="border-border/50 shadow-sm overflow-hidden dark:card-glow">
                <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">Document Metadata</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Created Date</p>
                    <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Authoring Physician</p>
                    <p className="text-sm font-bold">Dr. AI Assistant (Synthesized)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Hospital ID</p>
                    <p className="text-sm font-bold font-mono">HOSP-772-913</p>
                  </div>
                  <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
                    <button className="flex items-center justify-between w-full p-3 rounded-xl bg-muted/50 hover:bg-primary/5 hover:text-primary transition-all group">
                      <span className="text-[10px] font-black uppercase tracking-widest">External Records</span>
                      <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm overflow-hidden dark:card-glow bg-primary/[0.02]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Search className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Smart Analysis</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Our AI models have indexed this record for semantic similarity. Use the &quot;Case Search&quot; tool in the chat to find clinically similar cases.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
