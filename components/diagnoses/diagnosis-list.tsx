"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExploreProtocolsButton } from "./explore-protocols-button";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export function DiagnosisList({ hadmId }: { hadmId: number }) {
  const diagnoses = useQuery(api.queries.getDiagnosesByAdmission, {
    hadm_id: hadmId,
  });

  if (!diagnoses) {
    return <Skeleton className="h-64 w-full rounded-xl dark:card-glow" />;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Card className="border-border/50 shadow-sm overflow-hidden dark:card-glow">
        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-[var(--color-brand-warning)]" />
            Diagnoses ({diagnoses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {diagnoses.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground italic">No diagnoses on record.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {diagnoses.map((dx, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start justify-between gap-4 rounded-xl border border-border/50 p-4 transition-all group",
                    "bg-card hover:bg-muted/5 dark:bg-brand-surface dark:hover:bg-brand-surface/80"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <Badge variant="outline" className="font-mono text-[10px] bg-muted/50 border-border/50 px-1.5 h-5 text-muted-foreground">
                        {dx.icd9_code}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Seq #{dx.seq_num}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {dx.short_title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {dx.long_title}
                    </p>
                  </div>
                  <ExploreProtocolsButton
                    icd9Code={dx.icd9_code}
                    diagnosisTitle={dx.short_title}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
