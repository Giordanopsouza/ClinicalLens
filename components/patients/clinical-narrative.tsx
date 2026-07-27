"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClinicalNarrativeProps {
  summary: string;
}

export function ClinicalNarrative({ summary }: ClinicalNarrativeProps) {
  // Simple heuristic to generate some "clinical markers" from the summary
  const generateMarkers = (text: string) => {
    const markers = [];
    if (text.toLowerCase().includes("heart failure") || text.toLowerCase().includes("chf")) markers.push("CHF");
    if (text.toLowerCase().includes("kidney") || text.toLowerCase().includes("renal") || text.toLowerCase().includes("aki")) markers.push("AKI");
    if (text.toLowerCase().includes("diabetes") || text.toLowerCase().includes("glucose")) markers.push("Diabetes");
    if (text.toLowerCase().includes("edema")) markers.push("Edema");
    if (text.toLowerCase().includes("hypertension") || text.toLowerCase().includes("bp")) markers.push("HTN");
    return markers.slice(0, 4);
  };

  const markers = generateMarkers(summary);

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden dark:card-glow group">
      <CardHeader className="bg-muted/30 border-b border-border/50 py-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Clinical Narrative Summary
        </CardTitle>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
          <Sparkles className="h-3 w-3 animate-pulse" />
          AI Synthesized
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm leading-relaxed text-foreground/80 font-medium">
          {summary.length > 500 ? summary.slice(0, 500) + "..." : summary}
        </p>
        {markers.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {markers.map((marker) => (
              <span 
                key={marker} 
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-[10px] font-black text-muted-foreground uppercase tracking-widest border border-border/50 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-colors duration-300 cursor-default"
              >
                #{marker}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
