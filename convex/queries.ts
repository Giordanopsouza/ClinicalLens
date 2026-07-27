import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

type LabDictionaryEntry = {
  lab_name: string;
  fluid?: string;
  category?: string;
};

type DiagnosisDictionaryEntry = {
  short_title: string;
  long_title: string;
};

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// Helper to check authentication
async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call. Please sign in.");
  }
  return identity;
}

export const getPatientList = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);

    const results = await ctx.db
      .query("clinical_cases")
      .order("asc")
      .take(limit);

    return results.map((clinicalCase) => ({
      _id: clinicalCase._id,
      case_id: clinicalCase.case_id,
      subject_id: clinicalCase.subject_id,
      hadm_id: clinicalCase.hadm_id,
      age: clinicalCase.age,
      gender: clinicalCase.gender,
      admission_diagnosis: clinicalCase.admission_diagnosis,
      // Note: discharge_summary intentionally omitted for list views to keep payloads small
    }));
  },
});

export const getPatientById = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    return await ctx.db
      .query("clinical_cases")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .first();
  },
});

export const getLabsByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    const itemIds = [...new Set(labs.map((lab) => lab.itemid))];
    const dictionaryRows = await Promise.all(
      itemIds.map(async (itemid) => {
        const entry = await ctx.db
          .query("lab_dictionary")
          .withIndex("by_itemid", (q) => q.eq("itemid", itemid))
          .first();
        return [itemid, entry] as const;
      }),
    );

    const dictionaryMap = new Map<number, LabDictionaryEntry>();
    for (const [itemid, entry] of dictionaryRows) {
      if (entry) {
        dictionaryMap.set(itemid, entry);
      }
    }

    return labs.map((lab) => {
      const dictionary = dictionaryMap.get(lab.itemid);
      return {
        ...lab,
        lab_name: dictionary?.lab_name ?? `Unknown (${lab.itemid})`,
        fluid: dictionary?.fluid ?? null,
        category: dictionary?.category ?? null,
      };
    });
  },
});

export const getLabTrend = query({
  args: {
    hadm_id: v.number(),
    itemid: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id_itemid", (q) =>
        q.eq("hadm_id", args.hadm_id).eq("itemid", args.itemid),
      )
      .collect();

    const dictionary = await ctx.db
      .query("lab_dictionary")
      .withIndex("by_itemid", (q) => q.eq("itemid", args.itemid))
      .first();

    return {
      lab_name: dictionary?.lab_name ?? `Unknown (${args.itemid})`,
      fluid: dictionary?.fluid ?? null,
      category: dictionary?.category ?? null,
      data: labs
        .sort((a, b) => toTimestamp(a.charttime) - toTimestamp(b.charttime))
        .map((lab) => ({
          charttime: lab.charttime,
          value: lab.value,
          valuestr: lab.valuestr,
          unit: lab.unit,
        })),
    };
  },
});

export const getLabTypesForAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const labs = await ctx.db
      .query("labs")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    const counts = new Map<number, number>();
    for (const lab of labs) {
      counts.set(lab.itemid, (counts.get(lab.itemid) ?? 0) + 1);
    }

    const itemIds = [...counts.keys()];
    const dictionaryRows = await Promise.all(
      itemIds.map(async (itemid) => {
        const entry = await ctx.db
          .query("lab_dictionary")
          .withIndex("by_itemid", (q) => q.eq("itemid", itemid))
          .first();
        return [itemid, entry] as const;
      }),
    );

    const dictionaryMap = new Map<number, LabDictionaryEntry>();
    for (const [itemid, entry] of dictionaryRows) {
      if (entry) {
        dictionaryMap.set(itemid, entry);
      }
    }

    return itemIds
      .map((itemid) => {
        const dictionary = dictionaryMap.get(itemid);
        return {
          itemid,
          lab_name: dictionary?.lab_name ?? `Unknown (${itemid})`,
          category: dictionary?.category ?? null,
          count: counts.get(itemid) ?? 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  },
});

export const getPrescriptionsByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    return await ctx.db
      .query("prescriptions")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();
  },
});

export const getDiagnosesByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const diagnoses = await ctx.db
      .query("diagnoses")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();

    const codes = [...new Set(diagnoses.map((diagnosis) => diagnosis.icd9_code))];
    const dictionaryRows = await Promise.all(
      codes.map(async (code) => {
        const entry = await ctx.db
          .query("diagnosis_dictionary")
          .withIndex("by_icd9_code", (q) => q.eq("icd9_code", code))
          .first();
        return [code, entry] as const;
      }),
    );

    const dictionaryMap = new Map<string, DiagnosisDictionaryEntry>();
    for (const [code, entry] of dictionaryRows) {
      if (entry) {
        dictionaryMap.set(code, entry);
      }
    }

    return diagnoses
      .map((diagnosis) => {
        const dictionary = dictionaryMap.get(diagnosis.icd9_code);
        return {
          ...diagnosis,
          short_title: dictionary?.short_title ?? "Unknown",
          long_title: dictionary?.long_title ?? "Unknown",
        };
      })
      .sort((a, b) => a.seq_num - b.seq_num);
  },
});

export const getPatientByDocId = internalQuery({
  args: { id: v.id("clinical_cases") },
  handler: async (ctx, args) => {
    // Internal queries are typically invoked by trusted server environments (like actions), 
    // but for extra caution we can let it be, since it's internal only.
    return await ctx.db.get(args.id);
  },
});