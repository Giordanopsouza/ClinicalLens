"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Pill } from "lucide-react";

export function PrescriptionTable({ hadmId }: { hadmId: number }) {
  const prescriptions = useQuery(api.queries.getPrescriptionsByAdmission, {
    hadm_id: hadmId,
  });

  if (!prescriptions) {
    return <Skeleton className="h-64 w-full rounded-xl dark:card-glow" />;
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Card className="border-border/50 shadow-sm overflow-hidden dark:card-glow">
        <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Pill className="h-4 w-4 text-[var(--color-brand-success)]" />
            Medications ({prescriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {prescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground italic">No prescriptions on record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/20">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="text-xs font-bold uppercase tracking-wider h-10">Drug</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider h-10">Dose</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider h-10">Route</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider h-10">Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((rx: { drug: string; dose_value?: string; dose_unit?: string; route?: string; startdate?: string; enddate?: string }, i: number) => (
                    <TableRow key={i} className="border-border/40 hover:bg-muted/5 transition-colors">
                      <TableCell className="font-semibold text-sm py-3">{rx.drug}</TableCell>
                      <TableCell className="text-sm py-3 whitespace-nowrap">
                        <span className="bg-[var(--color-brand-success)]/10 text-[var(--color-brand-success)] px-2 py-0.5 rounded font-medium">
                          {rx.dose_value ?? "—"} {rx.dose_unit ?? ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">{rx.route ?? "—"}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground/70 py-3 font-mono">
                        <div className="flex flex-col">
                          <span>START: {rx.startdate ? new Date(rx.startdate).toLocaleDateString() : "—"}</span>
                          <span>END: {rx.enddate ? new Date(rx.enddate).toLocaleDateString() : "—"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
