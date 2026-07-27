import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "../../../convex/_generated/api";

export const labTrendTool = createTool({
  id: "lab-trend",
  description:
    "Fetch a time-series of laboratory measurements for a specific patient and lab type. Use this to chart trends in lab values like Hemoglobin, Creatinine, Glucose, etc. First call getLabTypesForAdmission to see available lab types, then use the itemid here.",
  inputSchema: z.object({
    hadm_id: z.number().describe("Hospital admission ID"),
    itemid: z.number().describe("Lab item ID (from lab dictionary)"),
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
      })
    ),
  }),
  execute: async ({ hadm_id, itemid }) => {
    const client = getConvexClient();
    const result = await client.query(api.queries.getLabTrend, {
      hadm_id,
      itemid,
    });
    return result;
  },
});

export const labTypesTool = createTool({
  id: "lab-types",
  description:
    "List all available lab test types for a patient's admission, with counts. Use this to discover which labs were measured before querying specific trends.",
  inputSchema: z.object({
    hadm_id: z.number().describe("Hospital admission ID"),
  }),
  outputSchema: z.object({
    labTypes: z.array(
      z.object({
        itemid: z.number(),
        lab_name: z.string(),
        category: z.string().nullable(),
        count: z.number(),
      })
    ),
  }),
  execute: async ({ hadm_id }) => {
    const client = getConvexClient();
    const labTypes = await client.query(
      api.queries.getLabTypesForAdmission,
      { hadm_id }
    );
    return { labTypes };
  },
});
