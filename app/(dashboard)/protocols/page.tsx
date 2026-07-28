"use client";

import { usePatient } from "@/context/patient-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search, Sparkles, ShieldCheck, Zap, Globe, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProtocolsPage() {
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
            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Protocols & Guidelines</h1>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1 opacity-60">
                Evidence-Based Clinical Decision Support
              </p>
            </div>
          </div>
          {patient && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Active Context: AEG-{patient.hadm_id}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto space-y-10">
          {/* AI Search Bar */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Agentic Protocol Search</h2>
            <div className="relative group">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-pulse" />
              <Input 
                placeholder="Ask Aegis about the latest 2026 guidelines for CHF, AKI, or Sepsis management..." 
                className="h-16 pl-14 bg-card border-primary/20 text-lg rounded-2xl shadow-xl shadow-primary/5 focus-visible:ring-2 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/40"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                Search Guidelines
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProtocolCategoryCard 
              icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
              title="Standard Precautions"
              count={12}
              description="Standard operating procedures for infection control and safety."
            />
            <ProtocolCategoryCard 
              icon={<Zap className="h-5 w-5 text-amber-500" />}
              title="Acute Management"
              count={8}
              description="High-priority response protocols for critical care scenarios."
            />
            <ProtocolCategoryCard 
              icon={<Globe className="h-5 w-5 text-blue-500" />}
              title="Clinical Trials"
              count={24}
              description="Ongoing research and investigational treatment guidelines."
            />
          </div>

          {/* Active Guidelines List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Recommended Guidelines</h3>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Library</button>
            </div>
            
            <div className="space-y-3">
              <GuidelineItem 
                title="Management of Acute Decompensated Heart Failure (2026 Update)"
                source="American College of Cardiology"
                date="Jan 2026"
                tags={["CHF", "Cardiology", "Acute"]}
              />
              <GuidelineItem 
                title="Sepsis-4 Clinical Diagnostic Criteria and Treatment"
                source="International Sepsis Forum"
                date="Dec 2025"
                tags={["Sepsis", "Infection", "Critical Care"]}
              />
              <GuidelineItem 
                title="Renal Replacement Therapy in AKI Stage 3"
                source="KDIGO Clinical Practice"
                date="Feb 2026"
                tags={["AKI", "Nephrology"]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtocolCategoryCard({ icon, title, count, description }: { icon: React.ReactNode; title: string; count: number; description: string }) {
  return (
    <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-all duration-300 group cursor-pointer dark:card-glow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
          <Badge variant="outline" className="text-[10px] font-black border-border/50">{count} DOCS</Badge>
        </div>
        <h4 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function GuidelineItem({ title, source, date, tags }: { title: string; source: string; date: string; tags: string[] }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer dark:card-glow">
      <div className="flex items-center gap-5">
        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{title}</h4>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            <span>{source}</span>
            <span className="size-1 bg-border rounded-full" />
            <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {tags.map(t => (
          <Badge key={t} variant="secondary" className="bg-muted/50 text-[9px] font-black uppercase tracking-tighter h-5">{t}</Badge>
        ))}
      </div>
    </div>
  );
}
