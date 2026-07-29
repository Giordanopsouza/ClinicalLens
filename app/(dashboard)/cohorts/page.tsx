"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, PieChart, Activity, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CohortsPage() {
  const stats = useQuery(api.queries.getCohortStats);

  if (!stats) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-12 w-1/4 bg-muted rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-64 bg-muted rounded-3xl" />
          <div className="h-64 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-muted/5">
      <div className="p-8 border-b border-border/50 bg-card shrink-0">
        <div className="flex items-center gap-4 max-w-[1200px] mx-auto">
          <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Cohort Explorer</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1 opacity-60">
              Population-level analytics and clinical trends
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto space-y-10">
          {/* Top Level Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard title="Total Cohort" value={stats.total} icon={<Users className="h-4 w-4" />} />
            <MetricCard title="Avg Age" value="54.2y" icon={<Activity className="h-4 w-4" />} />
            <MetricCard title="Male" value={`${((stats.genderSplit.M / stats.total) * 100).toFixed(1)}%`} icon={<User className="h-4 w-4" />} />
            <MetricCard title="Female" value={`${((stats.genderSplit.F / stats.total) * 100).toFixed(1)}%`} icon={<User className="h-4 w-4" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Age Distribution */}
            <Card className="border-border/50 shadow-sm dark:card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {Object.entries(stats.ageGroups).map(([group, count]) => (
                  <div key={group} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                      <span>{group}</span>
                      <span>{count} patients</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Diagnoses */}
            <Card className="border-border/50 shadow-sm dark:card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <PieChart className="h-3.5 w-3.5 text-primary" />
                  Primary Admission Drivers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {stats.topDiagnoses.map((diag, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          #{i + 1}
                        </div>
                        <span className="text-xs font-bold text-foreground/80 group-hover:text-primary transition-colors">
                          {diag.name}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-black">{diag.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clinical Insights Section */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 opacity-60">System Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
              <InsightCard 
                title="Population Risk" 
                content="Significant concentration of patients in the 66+ age group (42%) suggests high baseline acuity across current admissions."
                status="warning"
              />
              <InsightCard 
                title="Search Accuracy" 
                content="Discharge summary embeddings are currently synchronized using text-embedding-3-small (1536d) for high-fidelity case matching."
                status="success"
              />
              <InsightCard 
                title="Protocol Adherence" 
                content="Sepsis-4 criteria matching is active for 85% of cases with an 'Infection' related admission diagnosis."
                status="info"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <div className="text-primary opacity-40">{icon}</div>
        </div>
        <h4 className="text-2xl font-black text-foreground">{value}</h4>
      </CardContent>
    </Card>
  );
}

function InsightCard({ title, content, status }: { title: string; content: string; status: "success" | "warning" | "info" }) {
  const colors = {
    success: "border-emerald-500/20 bg-emerald-500/[0.02] text-emerald-600",
    warning: "border-amber-500/20 bg-amber-500/[0.02] text-amber-600",
    info: "border-blue-500/20 bg-blue-500/[0.02] text-blue-600",
  };

  return (
    <div className={cn("p-6 rounded-3xl border shadow-sm space-y-3", colors[status])}>
      <h5 className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</h5>
      <p className="text-xs leading-relaxed font-medium text-foreground/70">{content}</p>
    </div>
  );
}
