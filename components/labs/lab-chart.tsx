"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LabChartProps {
  hadmId: number;
  itemid: number;
}

export function LabChart({ hadmId, itemid }: LabChartProps) {
  const trend = useQuery(api.queries.getLabTrend, {
    hadm_id: hadmId,
    itemid: itemid,
  });

  if (!trend) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  const chartData = trend.data.map((d: any) => ({
    time: new Date(d.charttime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: d.value,
    unit: d.unit,
  }));

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>
            {trend.lab_name}
            {trend.fluid && (
              <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {trend.fluid}
              </span>
            )}
          </span>
          {chartData[0]?.unit && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Unit: {chartData[0].unit}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8">
        {chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center border-2 border-dashed border-muted rounded-xl">
            <p className="text-sm text-muted-foreground">No data points available.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground font-medium"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground font-medium"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "hsl(var(--primary))", fontWeight: "600" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 4, fill: "hsl(var(--background))", strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
