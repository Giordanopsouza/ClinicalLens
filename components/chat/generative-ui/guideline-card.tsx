"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Sparkles, Loader2 } from "lucide-react";
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
  results?: GuidelineResult[];
  answer?: string;
}

export function GuidelineCard({ query, results: initialResults, answer }: GuidelineCardProps) {
  const [results, setResults] = useState<GuidelineResult[]>(initialResults || []);
  const [loading, setLoading] = useState(!initialResults || initialResults.length === 0);

  useEffect(() => {
    if (initialResults && initialResults.length > 0) {
      setResults(initialResults);
      setLoading(false);
      return;
    }
    
    if (!query) return;
    setLoading(true);
    fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.results)) setResults(data.results);
      })
      .catch((e) => console.error("GuidelineCard fetch error:", e))
      .finally(() => setLoading(false));
  }, [query, initialResults]);
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

  const renderMarkdown = (text: string) => {
    // 1. Handle bold: **text**
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-foreground">$1</strong>');
    
    // 2. Handle bullet points (simple multiline support)
    // Replace "* " or "- " at start of line with a bullet div
    const lines = processed.split('\n');
    const renderedLines = lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 mb-1.5 pl-1">
            <span className="text-primary mt-1">•</span>
            <span dangerouslySetInnerHTML={{ __html: trimmed.substring(2) }} />
          </div>
        );
      }
      if (trimmed === '') return <div key={i} className="h-2" />;
      return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: trimmed }} />;
    });

    return renderedLines;
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
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">AI Synthesis</p>
            </div>
            <div className="text-[11px] leading-relaxed text-foreground/90 font-medium">
              {renderMarkdown(answer)}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 opacity-60">Evidence Sources</p>
          {loading ? (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground py-2 px-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Fetching sources…</span>
            </div>
          ) : results.length === 0 ? (
            <p className="text-[10px] text-muted-foreground italic px-1">No sources found.</p>
          ) : results.map((r, i) => (
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
                  {typeof r.score === 'number' ? `${(r.score * 100).toFixed(0)}% match` : 'Matched Source'}
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
