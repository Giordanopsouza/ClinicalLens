import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "@/convex/_generated/api";

export const labTypesTool = createTool({
  id: "lab-types",
  description:
    "List all types of lab tests available for a patient admission. Use this to discover what can be charted (e.g., Creatinine, Hemoglobin).",
  inputSchema: z.object({
    hadm_id: z.number().describe("Hospital admission ID"),
  }),
  outputSchema: z.object({
    labs: z.array(
      z.object({
        itemid: z.number(),
        lab_name: z.string(),
        category: z.string().nullable(),
        count: z.number(),
      }),
    ),
  }),
  execute: async ({ hadm_id }) => {
    const client = getConvexClient();
    const labTypes = await client.query(api.queries.getLabTypesForAdmission, {
      hadm_id,
    });

    return {
      labs: labTypes.map((lt: { itemid: number; lab_name: string; category: string | null; count: number }) => ({
        itemid: lt.itemid,
        lab_name: lt.lab_name,
        category: lt.category ?? null,
        count: lt.count,
      })),
    };
  },
});

export const labTrendTool = createTool({
  id: "lab-trend",
  description:
    "Retrieve time-series data for a specific lab test for a patient admission. Use this to analyze trends (e.g., rising creatinine, falling hemoglobin).",
  inputSchema: z.object({
    hadm_id: z.number().describe("Hospital admission ID"),
    itemid: z.number().describe("Lab item ID (e.g., 50912 for Creatinine)"),
  }),
  outputSchema: z.object({
    lab_name: z.string(),
    fluid: z.string().nullable(),
    category: z.string().nullable(),
    data: z.array(
      z.object({
        charttime: z.string(),
        value: z.number().nullable(),
        unit: z.string().nullable(),
      }),
    ),
  }),
  execute: async ({ hadm_id, itemid }) => {
    const client = getConvexClient();
    const trend = await client.query(api.queries.getLabTrend, {
      hadm_id,
      itemid,
    });

    return {
      lab_name: trend.lab_name,
      fluid: trend.fluid,
      category: trend.category,
      data: trend.data.map((d: { charttime: string; value?: number; valuestr?: string; unit?: string }) => ({
        charttime: d.charttime,
        value: d.value ?? null,
        unit: d.unit ?? null,
      })),
    };
  },
});
