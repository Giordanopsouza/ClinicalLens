"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Sparkles } from "lucide-react";

interface GuidelineResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

interface GuidelineCardProps {
  query: string;
  results: GuidelineResult[];
  answer?: string;
}

export function GuidelineCard({ query, results, answer }: GuidelineCardProps) {
  return (
    <Card className="my-2 border-primary/20 bg-primary/[0.01] shadow-sm overflow-hidden animate-in fade-in duration-500">
      <CardHeader className="pb-2 pt-3 px-4 bg-primary/5">
        <CardTitle className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          Clinical Guideline Search
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-medium truncate italic">
          Query: {query}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4">
        {answer && (
          <div className="rounded-xl bg-primary/10 border border-primary/10 p-3 relative overflow-hidden group">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">AI Synthesis</p>
            </div>
            <p className="text-[11px] leading-relaxed text-foreground/90 font-medium">
              {answer}
            </p>
            <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="h-12 w-12" />
            </div>
          </div>
        )}
        
        <div className="space-y-2.5">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1">Source Results</p>
          {results.map((r, i) => (
            <div key={i} className="rounded-lg border border-border/40 p-2.5 bg-card hover:bg-muted/5 transition-all group">
              <div className="flex items-start justify-between gap-3">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2"
                >
                  {r.title}
                  <ExternalLink className="ml-1 inline h-2.5 w-2.5 opacity-50 group-hover:opacity-100" />
                </a>
                <Badge variant="outline" className="shrink-0 text-[8px] h-3.5 px-1 bg-muted/30 border-none font-mono">
                  {(r.score * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="mt-1.5 line-clamp-3 text-[10px] leading-relaxed text-muted-foreground">
                {r.content}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
