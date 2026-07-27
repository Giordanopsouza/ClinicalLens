import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "@/convex/_generated/api";

export const patientQueryTool = createTool({
  id: "patient-query",
  description:
    "Look up a patient's full clinical record by their hospital admission ID (hadm_id). Returns demographics (age, gender), admission diagnosis, and discharge summary.",
  inputSchema: z.object({
    hadm_id: z.number().describe("The hospital admission ID to look up"),
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
    const patient = await client.query(api.queries.getPatientById, {
      hadm_id,
    });

    if (!patient) {
      throw new Error(`No patient found with hadm_id: ${hadm_id}`);
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
