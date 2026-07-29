"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GuidelineResult {
  title: string;
  url: string;
  content: string;
  score: number;
  source?: string;
  published_date?: string;
  evidence_strength?: "high" | "moderate" | "low" | "unclear";
}

interface GuidelineCardProps {
  query: string;
  results: GuidelineResult[];
  answer?: string;
}

export function GuidelineCard({ query, results, answer }: GuidelineCardProps) {
  const normalizedResults: GuidelineResult[] = Array.isArray(results)
    ? results
    : [];

  const formatFreshness = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      if (diffMonths < 1) return "Fresh (New)";
      if (diffMonths < 12) return `Updated ${diffMonths}m ago`;
      return `Published ${Math.floor(diffMonths / 12)}y ago`;
    } catch {
      return dateStr;
    }
  };

  const strengthColors = {
    high: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    moderate: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    low: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    unclear: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Card className="my-2 border-primary/20 bg-primary/[0.01] shadow-sm overflow-hidden animate-in fade-in duration-500 font-sans">
      <CardHeader className="pb-2 pt-3 px-4 bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          Clinical Guideline Search
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-bold truncate italic opacity-70">
          Query: {query}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4">
        {answer && (
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 relative overflow-hidden group">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">AI Synthesis</p>
            </div>
            <p className="text-[11px] leading-relaxed text-foreground/90 font-medium">
              {answer}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 opacity-60">Evidence Sources</p>
          {normalizedResults.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 p-3 bg-muted/20">
              <p className="text-[10px] text-muted-foreground font-medium">
                No evidence sources were returned for this response.
              </p>
            </div>
          )}
          {normalizedResults.map((r, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-3 bg-card hover:bg-muted/5 transition-all group shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2"
                >
                  {r.title}
                  <ExternalLink className="ml-1.5 inline h-2.5 w-2.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                </a>
                <Badge variant="outline" className="shrink-0 text-[8px] h-4 px-1.5 bg-muted/30 border-none font-black uppercase tracking-tighter">
                  {(r.score * 100).toFixed(0)}% match
                </Badge>
              </div>

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {r.source && (
                  <Badge variant="outline" className="text-[8px] h-4 px-1.5 bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-widest">
                    {r.source}
                  </Badge>
                )}
                {r.evidence_strength && (
                  <Badge variant="outline" className={cn("text-[8px] h-4 px-1.5 font-bold uppercase tracking-widest border", strengthColors[r.evidence_strength])}>
                    {r.evidence_strength} Evidence
                  </Badge>
                )}
                {r.published_date && (
                  <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1 ml-auto">
                    {formatFreshness(r.published_date)}
                  </span>
                )}
              </div>

              <p className="line-clamp-3 text-[10px] leading-relaxed text-muted-foreground font-medium">
                {r.content}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
