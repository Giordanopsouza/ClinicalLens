import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getConvexClient } from "./convex-client";
import { api } from "@/convex/_generated/api";

const DRUG_DIAGNOSIS_HINTS: Record<string, string[]> = {
  insulin: ["diabetes", "hyperglycemia", "250"],
  heparin: [
    "thrombosis",
    "embolism",
    "anticoagul",
    "dvt",
    "pe",
    "453",
    "415",
  ],
  warfarin: ["thrombosis", "fibrillation", "embolism", "427", "453"],
  metformin: ["diabetes", "250"],
  vancomycin: ["infection", "sepsis", "038", "995"],
  furosemide: ["heart failure", "edema", "428", "276"],
  lasix: ["heart failure", "edema", "428", "276"],
  metoprolol: ["hypertension", "heart", "401", "427", "428"],
  lisinopril: ["hypertension", "heart failure", "401", "428"],
  aspirin: ["cardiovascular", "coronary", "stroke", "414", "434"],
  amiodarone: ["fibrillation", "arrhythmia", "427"],
  levothyroxine: ["hypothyroid", "thyroid", "244"],
};

const NEPHROTOXIC_DRUGS = [
  "vancomycin",
  "gentamicin",
  "tobramycin",
  "ibuprofen",
  "naproxen",
  "ketorolac",
  "contrast",
];

const CREATININE_ITEMID = 50912;

export const safetyCheckTool = createTool({
  id: "safety-check",
  description:
    "Cross-reference a patient's prescriptions against their diagnoses and labs to find potential mismatches, interactions, or contraindications. Flags include missing diagnosis context, renal risks, and drug-drug interactions.",
  inputSchema: z.object({
    hadm_id: z.number().describe("Hospital admission ID to audit"),
  }),
  outputSchema: z.object({
    hadm_id: z.number(),
    total_prescriptions: z.number(),
    total_diagnoses: z.number(),
    flags: z.array(
      z.object({
        drug: z.string(),
        issue: z.string(),
        severity: z.enum(["info", "warning", "critical"]),
        category: z.enum(["diagnosis", "interaction", "renal", "documentation"]),
      })
    ),
    summary: z.string(),
  }),
  execute: async ({ hadm_id }) => {
    const client = getConvexClient();

    const [prescriptions, diagnoses, creatinineTrend] = await Promise.all([
      client.query(api.queries.getPrescriptionsByAdmission, { hadm_id }),
      client.query(api.queries.getDiagnosesByAdmission, { hadm_id }),
      client.query(api.queries.getLabTrend, { hadm_id, itemid: CREATININE_ITEMID }),
    ]);

    const diagnosisTitles = diagnoses.map(
      (d: { long_title?: string; short_title?: string }) =>
        (d.long_title || d.short_title || "").toLowerCase()
    );
    const icd9Codes = diagnoses.map(
      (d: { icd9_code: string }) => d.icd9_code
    );

    const flags: Array<{
      drug: string;
      issue: string;
      severity: "info" | "warning" | "critical";
      category: "diagnosis" | "interaction" | "renal" | "documentation";
    }> = [];

    const drugList = prescriptions.map(rx => (rx.drug || "").toLowerCase());

    // 1. Diagnosis Mismatch Check
    for (const rx of prescriptions) {
      const drugLower = (rx.drug || "").toLowerCase();

      for (const [drugKey, expectedTerms] of Object.entries(
        DRUG_DIAGNOSIS_HINTS
      )) {
        if (drugLower.includes(drugKey)) {
          const hasMatch = expectedTerms.some(
            (term) =>
              diagnosisTitles.some((dt: string) => dt.includes(term)) ||
              icd9Codes.some((code: string) => code.startsWith(term))
          );

          if (!hasMatch) {
            flags.push({
              drug: rx.drug,
              issue: `Prescribed ${rx.drug} but no matching diagnosis found for typical indications (${expectedTerms.slice(0, 3).join(", ")})`,
              severity: "warning",
              category: "diagnosis",
            });
          }
          break;
        }
      }

      // 2. Renal Check
      if (NEPHROTOXIC_DRUGS.some(nd => drugLower.includes(nd))) {
        const latestCreatinine = creatinineTrend.data[creatinineTrend.data.length - 1]?.value;
        if (latestCreatinine && latestCreatinine > 1.5) {
          flags.push({
            drug: rx.drug,
            issue: `Nephrotoxic drug ${rx.drug} prescribed while Creatinine is elevated (${latestCreatinine} mg/dL).`,
            severity: "critical",
            category: "renal",
          });
        }
      }

      // 3. Documentation Check
      if (!rx.startdate && !rx.enddate) {
        flags.push({
          drug: rx.drug,
          issue: `No start or end date recorded for ${rx.drug}`,
          severity: "info",
          category: "documentation",
        });
      }
    }

    // 4. Interaction Check (Simple Prototype)
    if (drugList.some(d => d.includes("warfarin")) && drugList.some(d => d.includes("aspirin"))) {
      flags.push({
        drug: "Warfarin + Aspirin",
        issue: "Concurrent use of anticoagulants and antiplatelets increases major bleeding risk.",
        severity: "critical",
        category: "interaction",
      });
    }

    if (drugList.some(d => d.includes("lisinopril")) && drugList.some(d => d.includes("spironolactone"))) {
      flags.push({
        drug: "Lisinopril + Spironolactone",
        issue: "Combination risk of severe hyperkalemia. Monitor potassium closely.",
        severity: "warning",
        category: "interaction",
      });
    }

    const summary =
      flags.length === 0
        ? `No safety flags identified for admission ${hadm_id}. ${prescriptions.length} prescriptions checked.`
        : `Found ${flags.length} potential clinical safety flags across ${prescriptions.length} prescriptions for admission ${hadm_id}.`;

    return {
      hadm_id,
      total_prescriptions: prescriptions.length,
      total_diagnoses: diagnoses.length,
      flags,
      summary,
    };
  },
});
