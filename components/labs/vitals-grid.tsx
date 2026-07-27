"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Activity, Droplets, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

export function VitalsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <VitalCard 
        title="Creatinine"
        value="1.6"
        unit="mg/dL"
        status="HIGH"
        statusVariant="destructive"
        trend={[30, 40, 55, 75, 90]}
      />
      <VitalCard 
        title="Hemoglobin"
        value="11.2"
        unit="g/dL"
        status="LOW"
        statusVariant="warning"
        trend={[80, 75, 70, 65, 60]}
      />
      <VitalCard 
        title="Glucose"
        value="142"
        unit="mg/dL"
        status="NORMAL"
        statusVariant="success"
        trend={[40, 60, 45, 70, 50]}
      />
    </div>
  );
}

interface VitalCardProps {
  title: string;
  value: string;
  unit: string;
  status: string;
  statusVariant: "success" | "warning" | "destructive";
  trend: number[];
}

function VitalCard({ title, value, unit, status, statusVariant, trend }: VitalCardProps) {
  const statusColors = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    destructive: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <Card className="border-border/50 shadow-sm dark:card-glow overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
            <h4 className="text-3xl font-black tracking-tighter">
              {value} <span className="text-sm font-medium text-muted-foreground ml-1">{unit}</span>
            </h4>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider",
            statusColors[statusVariant]
          )}>
            {status}
          </span>
        </div>
        
        {/* Simple Sparkline Visualization */}
        <div className="h-12 w-full flex items-end gap-1.5 px-1">
          {trend.map((height, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 rounded-sm transition-all duration-500 group-hover:opacity-100",
                i === trend.length - 1 ? "bg-primary" : "bg-primary/20 opacity-60"
              )}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground mt-3 text-center font-bold uppercase tracking-[0.2em]">72-Hour Trend</p>
      </CardContent>
    </Card>
  );
}
