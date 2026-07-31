"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, FlaskConical, TrendingUp } from "lucide-react";

interface LabChartProps {
  hadmId: number;
  itemid: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Clock className="size-3" /> {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white italic">
            {payload[0].value}
          </span>
          <span className="text-[10px] font-bold text-primary uppercase">
            {payload[0].payload.unit}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export function LabChart({ hadmId, itemid }: LabChartProps) {
  const trend = useQuery(api.queries.getLabTrend, {
    hadm_id: hadmId,
    itemid: itemid,
  });

  if (!trend) {
    return <Skeleton className="h-80 w-full rounded-[2rem]" />;
  }

  const chartData = trend.data.map((d: { charttime: string; value?: number; valuestr?: string; unit?: string }) => ({
    time: new Date(d.charttime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: d.value,
    unit: d.unit || "unit",
  }));

  const lastValue = chartData[chartData.length - 1];

  return (
    <Card className="border-border/50 shadow-xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="p-8 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground">
                  {trend.lab_name}
                </CardTitle>
                <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-muted border-border/50 px-1.5 h-4">
                  {trend.fluid || "Unknown Fluid"}
                </Badge>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-60 flex items-center gap-2">
                <TrendingUp className="size-3" /> Historical Trend Analysis
              </p>
            </div>
          </div>

          {lastValue && (
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm">
              <div className="text-right">
                <p className="text-[8px] font-black text-primary uppercase tracking-widest leading-none">Latest Reading</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <p className="text-2xl font-black text-foreground italic">{lastValue.value}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase">{lastValue.unit}</p>
                </div>
              </div>
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="size-5 text-primary animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-12">
        {chartData.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/5">
            <FlaskConical className="size-10 text-muted-foreground/20 mb-4" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No longitudinal data points found</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="4 4" 
                  vertical={false} 
                  className="stroke-border/50" 
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fontWeight: 800 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  className="fill-muted-foreground uppercase tracking-tighter"
                />
                <YAxis
                  tick={{ fontSize: 9, fontWeight: 800 }}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  className="fill-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  animationDuration={1500}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--foreground))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
