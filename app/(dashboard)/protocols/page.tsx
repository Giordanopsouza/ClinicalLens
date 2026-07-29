"use client";

import { useState } from "react";
import { usePatient } from "@/context/patient-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Search, Sparkles, ShieldCheck, Zap, Globe, Scale, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  source?: string;
  published_date?: string;
  evidence_strength?: string;
}

interface GroundednessReport {
  score: number;
  verdict: "high" | "medium" | "low";
  supported_claims: number;
  total_claims: number;
  unsupported_claims: string[];
  cited_urls: string[];
}

export default function ProtocolsPage() {
  const { selectedHadmId } = usePatient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [groundedness, setGroundedness] = useState<GroundednessReport | null>(null);

  const patient = useQuery(
    api.queries.getPatientById,
    selectedHadmId ? { hadm_id: selectedHadmId } : "skip"
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: searchQuery,
        }),
      });
      
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
        setAnswer(data.answer || null);
        setGroundedness(data.groundedness || null);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask Aegis about the latest 2026 guidelines for CHF, AKI, or Sepsis management..." 
                className="h-16 pl-14 pr-40 bg-card border-primary/20 text-lg rounded-2xl shadow-xl shadow-primary/5 focus-visible:ring-2 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/40"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                Search Guidelines
              </button>
            </div>
          </div>

          {answer && (
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Synthesis</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 font-medium">{answer}</p>
            </div>
          )}

          {groundedness && (
            <div className="p-4 rounded-2xl border border-border/50 bg-card">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Groundedness Check
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-black uppercase tracking-wider",
                    groundedness.verdict === "high" && "border-emerald-500/30 text-emerald-600",
                    groundedness.verdict === "medium" && "border-amber-500/30 text-amber-600",
                    groundedness.verdict === "low" && "border-red-500/30 text-red-600"
                  )}
                >
                  {Math.round(groundedness.score * 100)}% · {groundedness.verdict}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Supported claims: {groundedness.supported_claims}/{groundedness.total_claims}
              </p>
              {groundedness.unsupported_claims.length > 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Review needed: {groundedness.unsupported_claims[0]}
                </p>
              )}
            </div>
          )}

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
          <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
                {results.length > 0 ? "Search Results" : "Recommended Guidelines"}
              </h3>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline opacity-60">View All Library</button>
            </div>
            
            <div className="space-y-3">
              {results.length > 0 ? (
                results.map((r, i) => (
                  <GuidelineItem 
                    key={i}
                    title={r.title}
                    source={r.source || "Web Resource"}
                    date={r.published_date || "Current"}
                    url={r.url}
                    strength={r.evidence_strength}
                    content={r.content}
                  />
                ))
              ) : (
                <>
                  <GuidelineItem 
                    title="Management of Acute Decompensated Heart Failure (2026 Update)"
                    source="American College of Cardiology"
                    date="Jan 2026"
                  />
                  <GuidelineItem 
                    title="Sepsis-4 Clinical Diagnostic Criteria and Treatment"
                    source="International Sepsis Forum"
                    date="Dec 2025"
                  />
                  <GuidelineItem 
                    title="Renal Replacement Therapy in AKI Stage 3"
                    source="KDIGO Clinical Practice"
                    date="Feb 2026"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtocolCategoryCard({ icon, title, count, description }: { icon: React.ReactNode; title: string; count: number; description: string }) {
  return (
    <Card className="border-border/50 shadow-sm hover:border-primary/30 transition-all duration-300 group cursor-pointer dark:card-glow bg-card">
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

function GuidelineItem({ 
  title, 
  source, 
  date, 
  url, 
  strength, 
  content 
}: { 
  title: string; 
  source: string; 
  date: string; 
  url?: string;
  strength?: string;
  content?: string;
}) {
  return (
    <div 
      className="p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group dark:card-glow cursor-pointer"
      onClick={() => url && window.open(url, "_blank")}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-all shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-1">{title}</h4>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              <span className="flex items-center gap-1.5">{source}</span>
              <span className="size-1 bg-border rounded-full" />
              <span>{date}</span>
              {strength && (
                <>
                  <span className="size-1 bg-border rounded-full" />
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] border",
                    strength === "high" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" : "bg-blue-500/5 text-blue-600 border-blue-500/10"
                  )}>
                    {strength} Evidence
                  </span>
                </>
              )}
            </div>
            {content && (
              <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{content}</p>
            )}
          </div>
        </div>
        {url && (
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
        )}
      </div>
    </div>
  );
}
