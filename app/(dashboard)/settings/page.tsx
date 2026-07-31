"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  Shield, 
  Cpu, 
  Bell, 
  Globe, 
  Database,
  Lock,
  Activity,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="h-full flex flex-col bg-muted/5">
      <div className="p-8 border-b border-border/50 bg-card shrink-0">
        <div className="flex items-center gap-4 max-w-[1200px] mx-auto">
          <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">System Settings</h1>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1 opacity-60">
              Manage your clinical workspace and AI preferences
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto">
          <Tabs defaultValue="profile" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="bg-muted/20 p-1 gap-1 border border-border/50 rounded-2xl h-auto flex-wrap sm:flex-nowrap">
              <TabsTrigger 
                value="profile" 
                className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                <User className="h-3.5 w-3.5 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="clinical" 
                className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                <Shield className="h-3.5 w-3.5 mr-2" />
                Clinical
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                <Cpu className="h-3.5 w-3.5 mr-2" />
                AI Agent
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all"
              >
                <Database className="h-3.5 w-3.5 mr-2" />
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 border-border/50 shadow-sm dark:card-glow overflow-hidden">
                  <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                    <CardTitle className="text-sm font-black uppercase tracking-widest">User Identification</CardTitle>
                    <CardDescription className="text-xs font-medium">Verified clinician credentials and access level</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="size-20 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden group">
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt={user.fullName || "User"} className="size-full object-cover" />
                        ) : (
                          <User className="size-8 text-primary" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-[8px] font-black text-white uppercase tracking-tighter">EDIT</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-foreground">{user?.fullName || "Karan Balaji"}</h3>
                          <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-tighter">VERIFIED</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-bold">{user?.primaryEmailAddress?.emailAddress || "karanarjunb@icloud.com"}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Clinical Access Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Role Type</label>
                        <div className="p-3 bg-muted/20 border border-border/50 rounded-xl font-bold text-xs text-foreground/80">
                          Senior Attending / Lead Researcher
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Organization</label>
                        <div className="p-3 bg-muted/20 border border-border/50 rounded-xl font-bold text-xs text-foreground/80">
                          Project Aegis - Clinical Lens
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm bg-card overflow-hidden h-fit">
                  <CardHeader className="pb-4 bg-muted/10 border-b border-border/50">
                    <CardTitle className="text-sm font-black uppercase tracking-widest">Access Logs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                      {[
                        { time: "Today, 14:12", event: "Login Success", ip: "192.168.1.45" },
                        { time: "Yesterday, 09:45", event: "Profile Sync", ip: "192.168.1.45" },
                        { time: "Mar 08, 23:41", event: "Mastra Handshake", ip: "192.168.1.22" },
                      ].map((log, i) => (
                        <div key={i} className="p-4 flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-foreground/80">{log.event}</span>
                            <span className="text-[8px] font-black text-muted-foreground/60">{log.time}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground italic font-medium">{log.ip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clinical" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsToggle 
                  icon={<Bell className="h-4 w-4" />}
                  title="High-Acuity Alerts"
                  description="Receive immediate push notifications for critical safety flags and life-threatening lab trends."
                  defaultValue={true}
                />
                <SettingsToggle 
                  icon={<Shield className="h-4 w-4" />}
                  title="Strict Safety Mode"
                  description="Enforce absolute diagnosis-medication cross-checking for every patient record viewed."
                  defaultValue={true}
                />
                <SettingsToggle 
                  icon={<Lock className="h-4 w-4" />}
                  title="Session Auto-Lock"
                  description="Automatically lock the clinical workbench after 15 minutes of inactivity for HIPAA compliance."
                  defaultValue={false}
                />
                <SettingsToggle 
                  icon={<Globe className="h-4 w-4" />}
                  title="Cross-Hospital Sync"
                  description="Include clinical protocols from federated research hospitals in search results."
                  defaultValue={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="ai" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-2 border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="pb-4 border-b border-border/50 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Intelligence Engine</CardTitle>
                        <CardDescription className="text-xs font-medium">Configuring Project Aegis (Clinical Copilot)</CardDescription>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-tighter">GEMINI 3.1 FLASH-LITE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Reasoning Strategy</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StrategyCard 
                          active={true}
                          title="Fast Response"
                          description="Prioritize speed for clinical triage and news."
                        />
                        <StrategyCard 
                          active={false}
                          title="Deep Research"
                          description="Comprehensive chain-of-thought for complex cases."
                        />
                        <StrategyCard 
                          active={false}
                          title="Conservative"
                          description="Minimalist output, strictly following established protocols."
                        />
                      </div>
                    </div>

                    <div className="pt-4 space-y-6 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-foreground/80">Proactive Search</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Automatically use Tavily for external clinical news and research.</p>
                        </div>
                        <div className="h-6 w-11 bg-primary rounded-full flex items-center px-1">
                          <div className="size-4 bg-white rounded-full ml-auto" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-foreground/80">Generative UI Rendering</p>
                          <p className="text-[10px] text-muted-foreground font-medium">Allow the agent to render interactive charts and evidence cards.</p>
                        </div>
                        <div className="h-6 w-11 bg-primary rounded-full flex items-center px-1">
                          <div className="size-4 bg-white rounded-full ml-auto" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/10 border-b border-border/50">
                      <CardTitle className="text-sm font-black uppercase tracking-widest">Agent Health</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <HealthMetric label="Mastra Runtime" status="operational" />
                      <HealthMetric label="Vector Search" status="operational" />
                      <HealthMetric label="Research Tool" status="operational" />
                      <HealthMetric label="Memory Store" status="operational" />
                    </CardContent>
                  </Card>
                  
                  <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="size-4" />
                      <h5 className="text-[10px] font-black uppercase tracking-widest">Model Warning</h5>
                    </div>
                    <p className="text-[10px] leading-relaxed font-medium text-amber-700/80">
                      You are using a preview model. Clinical reasoning accuracy is high but hallucinations in numerical lab values may still occur. Always verify with official archive.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Total Records" value="2,000" icon={<Database className="h-4 w-4" />} />
                <MetricCard title="Vector Dims" value="1,536" icon={<Activity className="h-4 w-4" />} />
                <MetricCard title="Last Seed" value="Mar 08" icon={<CheckCircle2 className="h-4 w-4" />} />
                <MetricCard title="Env Status" value="Healthy" icon={<CheckCircle2 className="h-4 w-4" />} />
              </div>
              
              <Card className="border-border/50 shadow-sm overflow-hidden mt-8">
                <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground/80">Data Pipeline Information</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Provider Endpoints</h5>
                      <div className="space-y-3">
                        <EndpointItem label="Convex" url="https://energetic-jaguar-742.convex.cloud" active={true} />
                        <EndpointItem label="Clerk" url="https://able-mammal-66.clerk.accounts.dev" active={true} />
                        <EndpointItem label="Tavily" url="https://api.tavily.com" active={true} />
                        <EndpointItem label="CopilotKit" url="/api/copilotkit" active={true} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Architecture</h5>
                      <div className="p-6 bg-muted/20 border border-border/50 rounded-3xl space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-black/5 flex items-center justify-center font-black text-xs">JS</div>
                          <p className="text-xs font-bold text-foreground/70">Next.js 15.1 + React 19</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center font-black text-[10px] text-blue-600 uppercase">Mastra</div>
                          <p className="text-xs font-bold text-foreground/70">Agentic Orchestration V1.3.7</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center font-black text-[10px] text-emerald-600 uppercase">Convex</div>
                          <p className="text-xs font-bold text-foreground/70">Real-time Backend & Vector DB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SettingsToggle({ icon, title, description, defaultValue }: { icon: React.ReactNode, title: string, description: string, defaultValue: boolean }) {
  return (
    <div className="p-6 rounded-3xl border border-border/50 bg-card hover:border-primary/20 transition-all group flex items-start gap-4">
      <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all shrink-0">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black uppercase tracking-tight text-foreground/90">{title}</h4>
          <div className={cn(
            "h-5 w-9 rounded-full flex items-center px-0.5 transition-colors cursor-pointer",
            defaultValue ? "bg-primary" : "bg-muted"
          )}>
            <div className={cn(
              "size-4 bg-white rounded-full shadow-sm transition-transform",
              defaultValue ? "translate-x-4" : "translate-x-0"
            )} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium pr-10">{description}</p>
      </div>
    </div>
  );
}

function StrategyCard({ active, title, description }: { active: boolean, title: string, description: string }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all cursor-pointer space-y-2",
      active ? "border-primary bg-primary/[0.02] shadow-sm" : "border-border/50 bg-muted/5 hover:border-border"
    )}>
      <div className="flex items-center justify-between">
        <h5 className={cn("text-[10px] font-black uppercase tracking-widest", active ? "text-primary" : "text-muted-foreground")}>{title}</h5>
        {active && <CheckCircle2 className="size-3 text-primary" />}
      </div>
      <p className="text-[10px] leading-tight font-bold opacity-60">{description}</p>
    </div>
  );
}

function HealthMetric({ label, status }: { label: string, status: "operational" | "degraded" | "down" }) {
  const colors = {
    operational: "bg-emerald-500",
    degraded: "bg-amber-500",
    down: "bg-red-500",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-foreground/70">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">{status}</span>
        <span className={cn("size-2 rounded-full", colors[status])} />
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

function EndpointItem({ label, url, active }: { label: string, url: string, active: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-red-500")} />
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80">{label}</span>
      </div>
      <p className="text-[9px] font-mono text-muted-foreground bg-muted/30 p-1.5 rounded-lg truncate">{url}</p>
    </div>
  );
}
