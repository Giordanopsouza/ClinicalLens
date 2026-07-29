"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";

export interface SafetyFlag {
  drug: string;
  issue: string;
  severity: "info" | "warning" | "critical";
  category?: "diagnosis" | "interaction" | "renal" | "documentation";
}

interface SafetyAlertCardProps {
  hadmId: number;
  flags: SafetyFlag[];
  summary: string;
}

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
    badge: "destructive" as const,
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    badge: "secondary" as const,
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
    badge: "outline" as const,
  },
};

export function SafetyAlertCard({
  hadmId,
  flags,
  summary,
}: SafetyAlertCardProps) {
  return (
    <Card className="my-2 border-yellow-500/20 bg-yellow-500/[0.02] shadow-sm overflow-hidden animate-in zoom-in-95 duration-300">
      <CardHeader className="pb-2 pt-3 px-4 bg-yellow-500/5">
        <CardTitle className="flex items-center gap-2 text-xs font-bold text-yellow-600 uppercase tracking-wider">
          <ShieldAlert className="h-3.5 w-3.5" />
          Safety Audit — Adm #{hadmId}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4 py-3">
        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic border-l-2 border-yellow-500/30 pl-2">
          {summary}
        </p>
        <div className="space-y-2">
          {flags.map((flag, i) => {
            const config = severityConfig[flag.severity] || severityConfig.info;
            const Icon = config.icon;
            return (
              <Alert key={i} className={`${config.bg} py-2.5 px-3 border-none shadow-none`}>
                <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                <AlertDescription className="ml-1.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[11px] text-foreground underline decoration-dotted">
                      {flag.drug}
                    </span>
                    <div className="flex gap-1">
                      <Badge variant={config.badge} className="text-[8px] h-3.5 px-1 uppercase tracking-tighter font-black">
                        {flag.severity}
                      </Badge>
                      {flag.category && (
                        <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase tracking-tighter font-bold border-muted-foreground/20 text-muted-foreground/70">
                          {flag.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">{flag.issue}</p>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
