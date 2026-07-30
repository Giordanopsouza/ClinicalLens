import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "@/convex/_generated/api";

export const patientQueryTool = createTool({
  id: "patient-query",
  description:
    "Look up a patient's full clinical record. If no hadm_id is provided, it will automatically retrieve the most recently accessed/active patient record.",
  inputSchema: z.object({
    hadm_id: z.number().optional().describe("The hospital admission ID to look up"),
  }),
  outputSchema: z.object({
    case_id: z.string(),
    subject_id: z.number(),
    hadm_id: z.number(),
    age: z.number(),
    gender: z.string(),
    admission_diagnosis: z.string(),
    discharge_summary: z.string(),
  }),
  execute: async ({ hadm_id }) => {
    const client = getConvexClient();
    
    let patient;
    if (hadm_id) {
      patient = await client.query(api.queries.getPatientById, {
        hadm_id,
      });
    } else {
      // Auto-fallback to the first patient in the list if no ID is provided
      // This is a robust fallback for the copilot when context is "active"
      const list = await client.query(api.queries.getPatientList, {
        paginationOpts: { numItems: 1, cursor: null }
      });
      if (list.page.length > 0) {
        patient = await client.query(api.queries.getPatientById, {
          hadm_id: list.page[0].hadm_id
        });
      }
    }

    if (!patient) {
      throw new Error(`No active patient found.`);
    }

    return {
      case_id: patient.case_id,
      subject_id: patient.subject_id,
      hadm_id: patient.hadm_id,
      age: patient.age,
      gender: patient.gender,
      admission_diagnosis: patient.admission_diagnosis,
      discharge_summary: patient.discharge_summary,
    };
  },
});
