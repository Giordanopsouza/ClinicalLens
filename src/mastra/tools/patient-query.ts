import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "@/convex/_generated/api";

export const patientQueryTool = createTool({
  id: "patient-query",
  description:
    "Look up a patient's full clinical record. Call this tool with no arguments to retrieve the currently active/selected patient. Optionally pass hadm_id to look up a specific patient by admission ID.",
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
  execute: async ({ hadm_id }, { requestContext }) => {
    const token = requestContext?.get("convexToken") as string | undefined;
    const client = getConvexClient(token);

    // Resolve hadm_id: prefer explicit arg, then the active patient from request context (set via x-hadm-id header)
    const resolvedHadmId =
      hadm_id ?? (requestContext?.get("activeHadmId") as number | undefined);

    let patient;
    if (resolvedHadmId) {
      patient = await client.query(api.queries.getPatientById, {
        hadm_id: resolvedHadmId,
      });
    } else {
      // Last resort: first patient in the list (should rarely happen)
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
      throw new Error(`No active patient found. Please select a patient first.`);
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
