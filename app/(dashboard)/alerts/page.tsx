"use client";

import { useState } from "react";
import { usePatient } from "@/context/patient-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, ShieldAlert, AlertTriangle, Info, CheckCircle2, History, ListFilter, User, Clock, UserPlus, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";

type Alert = Doc<"alerts">;

export default function AlertsPage() {
  const { selectedHadmId } = usePatient();
  const [statusTab, setStatusTab] = useState<"unresolved" | "archived">("unresolved");
  const [now] = useState(() => Date.now());

  const alerts = useQuery(
    api.queries.getAlerts,
    { 
      hadm_id: selectedHadmId ?? undefined,
      status: statusTab === "unresolved" ? "unresolved" : undefined
    }
  );

  // Filter archived tab to show both resolved and archived
  const filteredAlerts = statusTab === "unresolved" 
    ? alerts 
    : alerts?.filter(a => a.status === "resolved" || a.status === "archived");

  const stats = useQuery(api.queries.getAlerts, {});

  const criticalCount = stats?.filter(a => a.severity === "critical" && a.status === "unresolved").length ?? 0;
  const warningCount = stats?.filter(a => a.severity === "warning" && a.status === "unresolved").length ?? 0;
  const infoCount = stats?.filter(a => a.severity === "info" && a.status === "unresolved").length ?? 0;
  const resolvedCount = stats?.filter(a => a.status === "resolved" || a.status === "archived").length ?? 0;

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
                {selectedHadmId ? `Safety Queue for Patient AEG-${selectedHadmId}` : "Priority Clinical Safety & Reconciliation"}
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
            <StatCard title="Critical" count={criticalCount} color="text-red-600" bg="bg-red-500/5" border="border-red-500/20" />
            <StatCard title="Warnings" count={warningCount} color="text-amber-600" bg="bg-amber-500/5" border="border-amber-500/20" />
            <StatCard title="Information" count={infoCount} color="text-blue-600" bg="bg-blue-500/5" border="border-blue-500/20" />
            <StatCard title="Resolved" count={resolvedCount} color="text-emerald-600" bg="bg-emerald-500/5" border="border-emerald-500/20" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <ListFilter className="h-3.5 w-3.5" />
                Active Safety Queue
              </h2>
              <div className="flex gap-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <span 
                  className={cn("pb-1 cursor-pointer transition-all", statusTab === "unresolved" ? "text-primary border-b border-primary" : "opacity-40 hover:opacity-100")}
                  onClick={() => setStatusTab("unresolved")}
                >
                  Unresolved
                </span>
                <span 
                  className={cn("pb-1 cursor-pointer transition-all", statusTab === "archived" ? "text-primary border-b border-primary" : "opacity-40 hover:opacity-100")}
                  onClick={() => setStatusTab("archived")}
                >
                  Resolved & Archived
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredAlerts === undefined ? (
                <div className="py-20 text-center animate-pulse">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading safety queue...</p>
                </div>
              ) : filteredAlerts.length === 0 && statusTab === "unresolved" ? (
                <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500/20 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">All clear. No active alerts.</p>
                </div>
              ) : filteredAlerts.length === 0 && statusTab === "archived" ? (
                <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-3xl">
                  <Archive className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No historical alerts found.</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertCard 
                    key={alert._id}
                    alert={alert}
                    now={now}
                  />
                ))
              )}
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

function AlertCard({ alert, now }: { alert: Alert; now: number }) {
  const { _id, severity, title, hadm_id, timestamp, description, assignedTo, status, resolutionNote, history: alertHistory } = alert;
  
  const resolveAlert = useMutation(api.mutations.resolveAlert);
  const snoozeAlert = useMutation(api.mutations.snoozeAlert);
  const assignAlert = useMutation(api.mutations.assignAlert);
  const archiveAlert = useMutation(api.mutations.archiveAlert);

  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [note, setNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const config = {
    critical: { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-500/5", border: "border-red-500/20" },
    warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-500/5", border: "border-amber-500/20" },
    info: { icon: Info, color: "text-blue-600", bg: "bg-blue-500/5", border: "border-blue-500/20" },
  };

  const { icon: Icon, color, bg, border } = config[severity as keyof typeof config];

  const formatTime = (ts: number) => {
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
  };

  return (
    <div className={cn("flex flex-col gap-4 p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md bg-card", border)}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0", bg)}>
          <Icon className={cn("h-6 w-6", color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">{title}</h4>
            <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-none px-0", color)}>{severity}</Badge>
            {assignedTo && (
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[8px] font-black uppercase tracking-widest">
                Assigned: {assignedTo}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{description}</p>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> AEG-{hadm_id}</span>
            <span className="size-1 bg-border rounded-full" />
            <span>{formatTime(timestamp)}</span>
            {alertHistory && alertHistory.length > 0 && (
              <>
                <span className="size-1 bg-border rounded-full" />
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1 hover:text-primary transition-colors uppercase"
                >
                  <History className="h-3 w-3" /> {showHistory ? "Hide History" : `History (${alertHistory.length})`}
                </button>
              </>
            )}
          </div>
          
          {resolutionNote && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 text-xs">Resolution Note</p>
              <p className="text-[11px] text-foreground font-medium italic">&quot;{resolutionNote}&quot;</p>
            </div>
          )}

          {showHistory && alertHistory && (
            <div className="mt-6 space-y-3 border-t border-border/50 pt-4 animate-in slide-in-from-top-2 duration-300">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Audit Trail</p>
              {alertHistory.map((entry, i) => (
                <div key={i} className="flex gap-3 text-[10px] leading-tight">
                  <div className="size-1.5 rounded-full bg-primary/30 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold text-foreground/80 uppercase">
                      {entry.action} <span className="opacity-50">by</span> {entry.user}
                    </p>
                    {entry.note && <p className="text-muted-foreground font-medium italic">&quot;{entry.note}&quot;</p>}
                    <p className="text-[8px] opacity-40 font-black">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {status === "unresolved" && (
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0 self-start">
            <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="uppercase font-black tracking-tight">Resolve Clinical Alert</DialogTitle>
                  <DialogDescription className="text-xs">
                    Please provide a brief clinical note explaining the resolution or action taken.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <textarea 
                    className="w-full h-32 p-3 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none font-medium"
                    placeholder="e.g. Consulted with Cardiology, patient's doses were adjusted and stable."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsResolveDialogOpen(false)} className="text-[10px] font-black uppercase tracking-widest">Cancel</Button>
                  <Button 
                    disabled={!note.trim()} 
                    onClick={() => resolveAlert({ alertId: _id, note }).then(() => {
                      setIsResolveDialogOpen(false);
                      setNote("");
                    })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest"
                  >
                    Confirm Resolution
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <button 
              onClick={() => snoozeAlert({ alertId: _id, durationMinutes: 60 })}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-muted text-[9px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
            >
              <Clock className="h-3.5 w-3.5" /> 1h Snooze
            </button>

            <button 
              onClick={() => assignAlert({ alertId: _id, assignee: "Me" })}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-muted text-[9px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" /> Claim
            </button>
          </div>
        )}

        {(status === "resolved" || status === "archived") && (
          <div className="flex shrink-0 self-center">
            {status === "resolved" ? (
              <button 
                onClick={() => archiveAlert({ alertId: _id })}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-muted text-[9px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </button>
            ) : (
              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Archived</Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
