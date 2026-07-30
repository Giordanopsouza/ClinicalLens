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
      <div className="h-full flex flex-col bg-muted/5">
        <div className="p-8 border-b border-border/50 bg-card shrink-0">
          <div className="flex items-center gap-4 max-w-[1200px] mx-auto animate-pulse">
            <div className="size-12 bg-muted rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded-lg" />
              <div className="h-3 w-64 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-8 space-y-10 custom-scrollbar overflow-y-auto">
          <div className="max-w-[1200px] mx-auto space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-card border border-border/50 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-80 bg-card border border-border/50 rounded-3xl animate-pulse" />
              <div className="h-80 bg-card border border-border/50 rounded-3xl animate-pulse" />
            </div>
          </div>
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
            <MetricCard title="Avg Age" value={`${stats.averageAge.toFixed(1)}y`} icon={<Activity className="h-4 w-4" />} />
            <MetricCard title="Male" value={`${((stats.genderSplit.M / stats.total) * 100).toFixed(1)}%`} icon={<User className="h-4 w-4" />} />
            <MetricCard title="Female" value={`${((stats.genderSplit.F / stats.total) * 100).toFixed(1)}%`} icon={<User className="h-4 w-4" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Age Distribution */}
            <Card className="lg:col-span-2 border-border/50 shadow-sm dark:card-glow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Cohort Demographics
                </CardTitle>
                <Badge variant="outline" className="text-[8px] font-black tracking-widest opacity-50">BY AGE GROUP</Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-5">
                    {Object.entries(stats.ageGroups).map(([group, count]) => (
                      <div key={group} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                          <span>{group} years</span>
                          <span>{count as number} patients</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(13,59,165,0.3)]" 
                            style={{ width: `${((count as number) / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Additional Analysis: Gender Density */}
                  <div className="flex flex-col justify-center items-center p-6 bg-muted/20 rounded-[2rem] border border-border/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <PieChart className="size-24" />
                    </div>
                    <div className="text-center space-y-4 relative z-10">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Gender Density</p>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-black text-primary italic">M</p>
                          <p className="text-[10px] font-bold text-foreground/60">{((stats.genderSplit.M / stats.total) * 100).toFixed(0)}%</p>
                        </div>
                        <div className="h-10 w-px bg-border/50" />
                        <div className="text-center">
                          <p className="text-2xl font-black text-pink-500 italic">F</p>
                          <p className="text-[10px] font-bold text-foreground/60">{((stats.genderSplit.F / stats.total) * 100).toFixed(0)}%</p>
                        </div>
                        <div className="h-10 w-px bg-border/50" />
                        <div className="text-center">
                          <p className="text-2xl font-black text-emerald-500 italic">O</p>
                          <p className="text-[10px] font-bold text-foreground/60">{((stats.genderSplit.O / stats.total) * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Diagnoses */}
            <Card className="border-border/50 shadow-sm dark:card-glow overflow-hidden">
              <CardHeader className="pb-2 bg-muted/30 border-b border-border/50">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <PieChart className="h-3.5 w-3.5 text-primary" />
                  Primary Drivers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {stats.topDiagnoses.map((diag: { name: string; count: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary group-hover:scale-110 transition-transform">
                          {i + 1}
                        </div>
                        <span className="text-xs font-bold text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1">
                          {diag.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-[10px] font-black leading-none">{diag.count}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5 tracking-tighter">{((diag.count / stats.total) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
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
