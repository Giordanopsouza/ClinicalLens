import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedClinicalCase = mutation({
  args: {
    case_id: v.string(),
    subject_id: v.number(),
    hadm_id: v.number(),
    age: v.number(),
    gender: v.string(),
    admission_diagnosis: v.string(),
    discharge_summary: v.string(),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("clinical_cases", args);
  },
});

export const seedLab = mutation({
  args: {
    hadm_id: v.number(),
    itemid: v.number(),
    charttime: v.string(),
    value: v.optional(v.float64()),
    valuestr: v.optional(v.string()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("labs", args);
  },
});

export const seedLabsBatch = mutation({
  args: {
    labs: v.array(
      v.object({
        hadm_id: v.number(),
        itemid: v.number(),
        charttime: v.string(),
        value: v.optional(v.float64()),
        valuestr: v.optional(v.string()),
        unit: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const lab of args.labs) {
      await ctx.db.insert("labs", lab);
    }
  },
});

export const seedLabDictionary = mutation({
  args: {
    itemid: v.number(),
    lab_name: v.string(),
    fluid: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("lab_dictionary", args);
  },
});

export const seedPrescription = mutation({
  args: {
    subject_id: v.number(),
    hadm_id: v.number(),
    drug: v.string(),
    dose_value: v.optional(v.string()),
    dose_unit: v.optional(v.string()),
    route: v.optional(v.string()),
    startdate: v.optional(v.string()),
    enddate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("prescriptions", args);
  },
});

export const seedPrescriptionsBatch = mutation({
  args: {
    prescriptions: v.array(
      v.object({
        subject_id: v.number(),
        hadm_id: v.number(),
        drug: v.string(),
        dose_value: v.optional(v.string()),
        dose_unit: v.optional(v.string()),
        route: v.optional(v.string()),
        startdate: v.optional(v.string()),
        enddate: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const prescription of args.prescriptions) {
      await ctx.db.insert("prescriptions", prescription);
    }
  },
});

export const seedDiagnosis = mutation({
  args: {
    subject_id: v.number(),
    hadm_id: v.number(),
    seq_num: v.number(),
    icd9_code: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("diagnoses", args);
  },
});

export const seedDiagnosesBatch = mutation({
  args: {
    diagnoses: v.array(
      v.object({
        subject_id: v.number(),
        hadm_id: v.number(),
        seq_num: v.number(),
        icd9_code: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const diagnosis of args.diagnoses) {
      await ctx.db.insert("diagnoses", diagnosis);
    }
  },
});

export const seedDiagnosisDictionary = mutation({
  args: {
    icd9_code: v.string(),
    short_title: v.string(),
    long_title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("diagnosis_dictionary", args);
  },
});

export const updateCaseEmbedding = mutation({
  args: {
    hadm_id: v.number(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    const clinicalCase = await ctx.db
      .query("clinical_cases")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .first();

    if (!clinicalCase) {
      return;
    }

    await ctx.db.patch(clinicalCase._id, { embedding: args.embedding });
  },
});
