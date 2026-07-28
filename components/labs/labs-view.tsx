"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LabChart } from "./lab-chart";
import { VitalsGrid } from "./vitals-grid";
import { FlaskConical, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function LabsView({ hadmId }: { hadmId: number }) {
  const labTypes = useQuery(api.queries.getLabTypesForAdmission, {
    hadm_id: hadmId,
  });
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  if (!labTypes) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const filteredLabs = labTypes.filter(lt => 
    lt.lab_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Vital Metrics Grid (Inspiration-driven) */}
      <VitalsGrid />

      {/* Lab Dictionary / Selection */}
      <Card className="border-border/50 shadow-sm overflow-hidden dark:card-glow">
        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              Comprehensive Lab Panels ({labTypes.length})
            </CardTitle>
            <div className="relative w-full md:w-64 group">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Filter lab types..."
                className="h-8 pl-8 text-xs bg-background/50 border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {filteredLabs.map((lt: any) => (
              <button
                key={lt.itemid}
                onClick={() => setSelectedItemId(selectedItemId === lt.itemid ? null : lt.itemid)}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 border",
                  selectedItemId === lt.itemid 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                    : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                )}
              >
                {lt.lab_name}
                <span className={cn(
                  "ml-2 px-1.5 py-0.5 rounded text-[9px] font-black",
                  selectedItemId === lt.itemid ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {lt.count}
                </span>
              </button>
            ))}
            {filteredLabs.length === 0 && (
              <p className="text-xs text-muted-foreground italic p-4">No matching lab results found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedItemId ? (
        <LabChart hadmId={hadmId} itemid={selectedItemId} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/50 rounded-3xl bg-muted/5 group hover:bg-primary/[0.02] hover:border-primary/20 transition-all duration-500">
          <div className="size-16 rounded-full bg-muted/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
            <FlaskConical className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary/60" />
          </div>
          <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">Select a lab panel to visualize trends</p>
          <p className="mt-2 text-xs text-muted-foreground/60">Time-series data will be analyzed by Clinical Lens Copilot</p>
        </div>
      )}
    </div>
  );
}
