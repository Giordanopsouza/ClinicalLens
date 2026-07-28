"use client";

import { usePatient } from "@/context/patient-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, ShieldAlert, AlertTriangle, Info, CheckCircle2, History, ListFilter, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const { selectedHadmId } = usePatient();
  const patient = useQuery(
    api.queries.getPatientById,
    selectedHadmId ? { hadm_id: selectedHadmId } : "skip"
  );

  return (
    <div className="h-full flex flex-col bg-muted/5">
      <div className="p-8 border-b border-border/50 bg-card shrink-0">
        <div className="flex items-center justify-between gap-4 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-600 border border-red-500/20">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Alert Center</h1>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1 opacity-60">
                Priority Clinical Safety & Reconciliation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-colors">
              <History className="h-3.5 w-3.5" /> History
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark All Read
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto space-y-10">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Critical" count={2} color="text-red-600" bg="bg-red-500/5" border="border-red-500/20" />
            <StatCard title="Warnings" count={5} color="text-amber-600" bg="bg-amber-500/5" border="border-amber-500/20" />
            <StatCard title="Information" count={12} color="text-blue-600" bg="bg-blue-500/5" border="border-blue-500/20" />
            <StatCard title="Resolved" count={48} color="text-emerald-600" bg="bg-emerald-500/5" border="border-emerald-500/20" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <ListFilter className="h-3.5 w-3.5" />
                Active Safety Queue
              </h2>
              <div className="flex gap-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <span className="text-primary border-b border-primary pb-1 cursor-pointer">Unresolved</span>
                <span className="opacity-40 cursor-pointer hover:opacity-100 transition-opacity">Archived</span>
              </div>
            </div>

            <div className="space-y-4">
              <AlertCard 
                severity="critical"
                title="Medication Interaction: Warfarin + Aspirin"
                patient={patient ? `AEG-${patient.hadm_id}` : "Global"}
                time="12 mins ago"
                description="High risk of gastrointestinal hemorrhage. Patient has history of peptic ulcer disease noted in discharge summary."
              />
              <AlertCard 
                severity="warning"
                title="Missing Diagnostic Context: Furosemide"
                patient="AEG-100001"
                time="2 hours ago"
                description="Prescription for IV Furosemide found but no corresponding diagnosis of Heart Failure or Edema in ICD-9 list."
              />
              <AlertCard 
                severity="info"
                title="Lab Result: Creatinine Up-trend"
                patient="AEG-100005"
                time="4 hours ago"
                description="Creatinine increased from 1.2 to 1.6 mg/dL over last 24 hours. Suggest checking BUN and electrolytes."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, count, color, bg, border }: { title: string; count: number; color: string; bg: string; border: string }) {
  return (
    <Card className={cn("border shadow-none", bg, border)}>
      <CardContent className="p-4 flex flex-col items-center justify-center">
        <p className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70", color)}>{title}</p>
        <h4 className={cn("text-2xl font-black", color)}>{count}</h4>
      </CardContent>
    </Card>
  );
}

function AlertCard({ severity, title, patient, time, description }: { severity: "critical" | "warning" | "info"; title: string; patient: string; time: string; description: string }) {
  const config = {
    critical: { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-500/5", border: "border-red-500/20" },
    warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/5", border: "border-amber-500/20" },
    info: { icon: Info, color: "text-blue-600", bg: "bg-blue-500/5", border: "border-blue-500/20" },
  };

  const { icon: Icon, color, bg, border } = config[severity];

  return (
    <div className={cn("flex flex-col md:flex-row gap-6 p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md cursor-pointer group dark:card-glow bg-card", border)}>
      <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", bg)}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">{title}</h4>
          <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-none px-0", color)}>{severity}</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
          <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {patient}</span>
          <span className="size-1 bg-border rounded-full" />
          <span>{time}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        <button className="px-4 py-2 rounded-xl bg-muted text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all">
          Investigate
        </button>
      </div>
    </div>
  );
}
