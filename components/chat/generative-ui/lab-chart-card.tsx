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
import { Clock, FlaskConical } from "lucide-react";

interface LabChartCardProps {
  hadmId: number;
  itemid: number;
  labName: string;
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

export function LabChartCard({ hadmId, itemid, labName }: LabChartCardProps) {
  const trend = useQuery(api.queries.getLabTrend, {
    hadm_id: hadmId,
    itemid: itemid,
  });

  if (!trend) {
    return <Skeleton className="h-64 w-full rounded-3xl" />;
  }

  const chartData = trend.data.map((d: { charttime: string; value?: number; unit?: string }) => ({
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
    <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden bg-background/50 backdrop-blur-sm my-4 animate-in zoom-in-95 duration-500">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-tight text-foreground">
                {labName}
              </CardTitle>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-60">AI Generated Trend</p>
            </div>
          </div>
          {lastValue && (
            <Badge variant="secondary" className="text-[10px] font-black italic">
              {lastValue.value} {lastValue.unit}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-8">
        {chartData.length === 0 ? (
          <p className="text-[10px] font-bold text-muted-foreground uppercase text-center py-8 opacity-40">No data points available</p>
        ) : (
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValueChat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 8, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground uppercase tracking-tighter"
                />
                <YAxis
                  tick={{ fontSize: 8, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  className="fill-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValueChat)"
                  activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--foreground))" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
