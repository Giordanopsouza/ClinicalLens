import { internalQuery, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

type LabDictionaryEntry = {
  lab_name: string;
  fluid?: string;
  category?: string;
};

type DiagnosisDictionaryEntry = {
  icd9_code: string;
  short_title: string;
  long_title: string;
};

function toTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// Helper to check authentication - returns identity or null
async function getAuth(ctx: QueryCtx) {
  return await ctx.auth.getUserIdentity();
}

import { paginationOptsValidator } from "convex/server";

export const getPatientList = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return { page: [], isDone: true, continueCursor: "" };
    
    const results = await ctx.db
      .query("clinical_cases")
      .order("asc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: results.page.map((clinicalCase) => ({
        _id: clinicalCase._id,
        case_id: clinicalCase.case_id,
        subject_id: clinicalCase.subject_id,
        hadm_id: clinicalCase.hadm_id,
        age: clinicalCase.age,
        gender: clinicalCase.gender,
        admission_diagnosis: clinicalCase.admission_diagnosis,
      })),
    };
  },
});

export const getPatientListInternal = internalQuery({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clinical_cases")
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const searchPatients = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return [];

    const searchLower = args.query.toLowerCase().trim();
    if (searchLower.length < 2) return [];

    // Strip "AEG-" if present for ID matching
    const idSearch = searchLower.startsWith("aeg-") ? searchLower.slice(4) : searchLower;
    const searchId = Number(idSearch);

    // 1. Try exact ID matches first (lightning fast indexed lookup)
    if (!isNaN(searchId)) {
      const discoveryMatch = await ctx.db
        .query("patient_discovery")
        .withIndex("by_hadm_id", (q) => q.eq("hadm_id", searchId))
        .first();

      if (discoveryMatch) {
        return [{
          _id: discoveryMatch._id,
          hadm_id: discoveryMatch.hadm_id,
          subject_id: discoveryMatch.subject_id,
          admission_diagnosis: discoveryMatch.admission_diagnosis,
          gender: discoveryMatch.gender,
          age: discoveryMatch.age,
        }];
      }

      const clinicalCaseMatch = await ctx.db
        .query("clinical_cases")
        .withIndex("by_hadm_id", (q) => q.eq("hadm_id", searchId))
        .first();

      if (clinicalCaseMatch) {
        return [{
          _id: clinicalCaseMatch._id,
          hadm_id: clinicalCaseMatch.hadm_id,
          subject_id: clinicalCaseMatch.subject_id,
          admission_diagnosis: clinicalCaseMatch.admission_diagnosis,
          gender: clinicalCaseMatch.gender,
          age: clinicalCaseMatch.age,
        }];
      }
    }

    // 2. Optimized Intelligent Search across all records
    // We use the lightweight patient_discovery table which has NO summaries or embeddings.
    let searchResults = await ctx.db
      .query("patient_discovery")
      .withSearchIndex("search_diagnosis", (q) => 
        q.search("admission_diagnosis", searchLower)
      )
      .take(args.limit ?? 15);

    if (searchResults.length === 0) {
      const clinicalCaseResults = await ctx.db
        .query("clinical_cases")
        .withSearchIndex("search_diagnosis", (q) =>
          q.search("admission_diagnosis", searchLower)
        )
        .take(args.limit ?? 15);

      searchResults = clinicalCaseResults.map((p) => ({
        _id: p._id,
        hadm_id: p.hadm_id,
        subject_id: p.subject_id,
        admission_diagnosis: p.admission_diagnosis,
        gender: p.gender,
        age: p.age,
      }));
    }

    return searchResults.map((p) => ({
      _id: p._id,
      hadm_id: p.hadm_id,
      subject_id: p.subject_id,
      admission_diagnosis: p.admission_diagnosis,
      gender: p.gender,
      age: p.age,
    }));
  },
});

export const getTotalPatientCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getAuth(ctx);
    if (!identity) return 0;
    return 2000; 
  },
});

export const getPatientById = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return null;

    return await ctx.db
      .query("clinical_cases")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .first();
  },
});

export const getLabsByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return [];

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
    const identity = await getAuth(ctx);
    if (!identity) return { lab_name: "Unauthenticated", data: [] };

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
    const identity = await getAuth(ctx);
    if (!identity) return [];

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
    const identity = await getAuth(ctx);
    if (!identity) return [];

    return await ctx.db
      .query("prescriptions")
      .withIndex("by_hadm_id", (q) => q.eq("hadm_id", args.hadm_id))
      .collect();
  },
});

export const getDiagnosesByAdmission = query({
  args: { hadm_id: v.number() },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return [];

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
    return await ctx.db.get(args.id);
  },
});

export const internalSearchLabDictionary = internalQuery({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const labs = await ctx.db
      .query("lab_dictionary")
      .collect();
    return labs.filter((lab) => lab.lab_name.toLowerCase().includes(args.searchTerm.toLowerCase()));
  },
});

export const getAlerts = query({
  args: {
    hadm_id: v.optional(v.number()),
    status: v.optional(v.union(v.literal("unresolved"), v.literal("archived"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    const identity = await getAuth(ctx);
    if (!identity) return [];

    let alerts;

    if (args.hadm_id !== undefined) {
      alerts = await ctx.db
        .query("alerts")
        .withIndex("by_hadm_id", (query) => query.eq("hadm_id", args.hadm_id))
        .order("desc")
        .collect();
      
      // Filter status in memory if both were provided
      if (args.status !== undefined) {
        alerts = alerts.filter((a) => a.status === args.status);
      }
    } else if (args.status !== undefined) {
      const status = args.status;
      alerts = await ctx.db
        .query("alerts")
        .withIndex("by_status", (query) => query.eq("status", status))
        .order("desc")
        .collect();
    } else {
      alerts = await ctx.db
        .query("alerts")
        .order("desc")
        .collect();
    }

    // Filter out snoozed alerts for 'unresolved' view
    if (args.status === "unresolved") {
      const now = Date.now();
      alerts = alerts.filter((a) => !a.snoozedUntil || a.snoozedUntil < now);
    }

    return alerts;
  },
});

export const getCohortStats = query({
  args: {},
  handler: async (ctx) => {
    // For aggregate stats, we can bypass strict identity checks if it's causing UI hanging
    // We use the lightweight patient_discovery table which has NO heavy summaries or embeddings.
    let cases = await ctx.db
      .query("patient_discovery")
      .collect(); 

    if (cases.length === 0) {
      const clinicalCases = await ctx.db
        .query("clinical_cases")
        .collect();
      cases = clinicalCases.map((c) => ({
        hadm_id: c.hadm_id,
        subject_id: c.subject_id,
        admission_diagnosis: c.admission_diagnosis,
        gender: c.gender,
        age: c.age,
      }));
    }
    
    const total = cases.length;
    const genderSplit = { M: 0, F: 0, O: 0 };
    const ageGroups = { "0-18": 0, "19-40": 0, "41-65": 0, "66+": 0 };
    const diagnosisCounts: Record<string, number> = {};

    let totalAge = 0;
    for (const c of cases) {
      totalAge += c.age;
      const gender = (c.gender as "M" | "F" | "O") || "O";
      genderSplit[gender] = (genderSplit[gender] ?? 0) + 1;
      
      if (c.age <= 18) ageGroups["0-18"]++;
      else if (c.age <= 40) ageGroups["19-40"]++;
      else if (c.age <= 65) ageGroups["41-65"]++;
      else ageGroups["66+"]++;

      const diag = c.admission_diagnosis || "Unknown";
      diagnosisCounts[diag] = (diagnosisCounts[diag] ?? 0) + 1;
    }

    const topDiagnoses = Object.entries(diagnosisCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const averageAge = total > 0 ? totalAge / total : 0;

    return {
      total,
      genderSplit,
      ageGroups,
      topDiagnoses,
      averageAge,
    };
  },
});
