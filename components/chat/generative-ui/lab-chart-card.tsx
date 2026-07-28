"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FlaskConical } from "lucide-react";

interface LabChartCardProps {
  hadmId: number;
  itemid: number;
  labName: string;
}

export function LabChartCard({ hadmId, itemid, labName }: LabChartCardProps) {
  const trend = useQuery(api.queries.getLabTrend, {
    hadm_id: hadmId,
    itemid: itemid,
  });

  const chartData = (trend?.data || []).map((d: any) => ({
    time: new Date(d.charttime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: d.value,
  }));

  return (
    <Card className="my-2 border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
          <FlaskConical className="h-3 w-3" />
          {labName} — Adm #{hadmId}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-3">
        {chartData.length === 0 ? (
          <p className="text-[10px] text-muted-foreground p-4 text-center">Loading chart data...</p>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData}>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ fontSize: '10px', borderRadius: '8px', padding: '4px 8px' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 2, fill: "hsl(var(--primary))" }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
