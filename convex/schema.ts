import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Core Clinical Cases ───────────────────────────────────────
  clinical_cases: defineTable({
    case_id: v.string(),
    subject_id: v.number(),
    hadm_id: v.number(),
    age: v.number(),
    gender: v.string(),
    admission_diagnosis: v.string(),
    discharge_summary: v.string(),
    // Vector embedding of discharge_summary for semantic search
    embedding: v.optional(v.array(v.float64())),
  })
    .index("by_hadm_id", ["hadm_id"])
    .index("by_subject_id", ["subject_id"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536, // text-embedding-3-small
      filterFields: ["hadm_id", "gender"],
    }),

  // ─── Laboratory Measurements ───────────────────────────────────
  labs: defineTable({
    hadm_id: v.number(),
    itemid: v.number(),
    charttime: v.string(), // ISO datetime string
    value: v.optional(v.float64()),
    valuestr: v.optional(v.string()), // some lab values are strings
    unit: v.optional(v.string()),
  })
    .index("by_hadm_id", ["hadm_id"])
    .index("by_hadm_id_itemid", ["hadm_id", "itemid"]),

  // ─── Lab Dictionary ────────────────────────────────────────────
  lab_dictionary: defineTable({
    itemid: v.number(),
    lab_name: v.string(),
    fluid: v.optional(v.string()),
    category: v.optional(v.string()),
  }).index("by_itemid", ["itemid"]),

  // ─── Prescriptions ────────────────────────────────────────────
  prescriptions: defineTable({
    subject_id: v.number(),
    hadm_id: v.number(),
    drug: v.string(),
    dose_value: v.optional(v.string()), // stored as string since CSV may have mixed formats
    dose_unit: v.optional(v.string()),
    route: v.optional(v.string()),
    startdate: v.optional(v.string()),
    enddate: v.optional(v.string()),
  })
    .index("by_hadm_id", ["hadm_id"])
    .index("by_subject_id", ["subject_id"]),

  // ─── Diagnoses ─────────────────────────────────────────────────
  diagnoses: defineTable({
    subject_id: v.number(),
    hadm_id: v.number(),
    seq_num: v.number(),
    icd9_code: v.string(),
  })
    .index("by_hadm_id", ["hadm_id"])
    .index("by_icd9_code", ["icd9_code"]),

  // ─── Diagnosis Dictionary ──────────────────────────────────────
  diagnosis_dictionary: defineTable({
    icd9_code: v.string(),
    short_title: v.string(),
    long_title: v.string(),
  }).index("by_icd9_code", ["icd9_code"]),

  // ─── Users & Roles ─────────────────────────────────────────────
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk's unique ID
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.string(), // 'clinician', 'admin', 'researcher'
  }).index("by_token", ["tokenIdentifier"]),
});
