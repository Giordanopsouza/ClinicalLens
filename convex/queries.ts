import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getPatientList = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const results = await ctx.db
      .query("clinical_cases")
      .order("asc")
      .take(limit);

    return results.map((c) => ({
      _id: c._id,
      case_id: c.case_id,
      subject_id: c.subject_id,
      hadm_id: c.hadm_id,
      age: c.age,
      gender: c.gender,
      admission_diagnosis: c.admission_diagnosis,
    }));
  },
});

export const getPatientById = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const cases = await ctx.db
      .query("clinical_cases")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();
    return cases[0] ?? null;
  },
});

export const getLabsByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    const enriched = await Promise.all(
      labs.map(async (lab) => {
        const dict = await ctx.db
          .query("lab_dictionary")
          .withIndex("by_itemid", (q) => q.eq("itemid", lab.itemid))
          .first();
        return {
          ...lab,
          lab_name: dict?.lab_name ?? `Unknown (${lab.itemid})`,
          fluid: dict?.fluid ?? null,
          category: dict?.category ?? null,
        };
      })
    );

    return enriched;
  },
});

export const getLabTrend = query({
  args: {
    hadm_id: v.number(),
    itemid: v.number(),
  },
  handler: async (ctx, args) => {
    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id_itemid", (q) =>
        q.eq("hadm_id", args.hadm_id).eq("itemid", args.itemid)
      )
      .collect();

    const dict = await ctx.db
      .query("lab_dictionary")
      .withIndex("by_itemid", (q) => q.eq("itemid", args.itemid))
      .first();

    return {
      lab_name: dict?.lab_name ?? `Unknown (${args.itemid})`,
      fluid: dict?.fluid ?? null,
      category: dict?.category ?? null,
      data: labs
        .sort(
          (a, b) =>
            new Date(a.charttime).getTime() - new Date(b.charttime).getTime()
        )
        .map((l) => ({
          charttime: l.charttime,
          value: l.value ?? null,
          unit: l.unit ?? null,
        })),
    };
  },
});

export const getLabTypesForAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    const uniqueItemIds = [...new Set(labs.map((l) => l.itemid))];

    const labTypes = await Promise.all(
      uniqueItemIds.map(async (itemid) => {
        const dict = await ctx.db
          .query("lab_dictionary")
          .withIndex("by_itemid", (q) => q.eq("itemid", itemid))
          .first();
        return {
          itemid,
          lab_name: dict?.lab_name ?? `Unknown (${itemid})`,
          category: dict?.category ?? null,
          count: labs.filter((l) => l.itemid === itemid).length,
        };
      })
    );

    return labTypes.sort((a, b) => b.count - a.count);
  },
});

export const getPrescriptionsByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("prescriptions")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();
  },
});

export const getDiagnosesByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const diagnoses = await ctx.db
      .query("diagnoses")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    const enriched = await Promise.all(
      diagnoses.map(async (dx) => {
        const dict = await ctx.db
          .query("diagnosis_dictionary")
          .withIndex("by_icd9_code", (q) => q.eq("icd9_code", dx.icd9_code))
          .first();
        return {
          ...dx,
          short_title: dict?.short_title ?? "Unknown",
          long_title: dict?.long_title ?? "Unknown",
        };
      })
    );

    return enriched.sort((a, b) => a.seq_num - b.seq_num);
  },
});

export const getPatientByDocId = internalQuery({
  args: { id: v.id("clinical_cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
