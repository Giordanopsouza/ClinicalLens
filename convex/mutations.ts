import { mutation, internalMutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

// Helper to check authentication for client-facing mutations (if any)
async function requireAuth(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call. Please sign in.");
  }
  return identity;
}

export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication");
    }

    // Check if we already have this user.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch it.
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name });
      }
      return user._id;
    }

    // If it's a new identity, create a new user.
    return await ctx.db.insert("users", {
      name: identity.name,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email,
      role: "clinician", // Default role
    });
  },
});

export const seedClinicalCase = internalMutation({
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

export const syncDiscoveryMetadata = internalMutation({
  args: {
    patients: v.array(
      v.object({
        hadm_id: v.number(),
        subject_id: v.number(),
        admission_diagnosis: v.optional(v.string()),
        gender: v.string(),
        age: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const patient of args.patients) {
      // Check if already exists
      const existing = await ctx.db
        .query("patient_discovery")
        .withIndex("by_hadm_id", (q) => q.eq("hadm_id", patient.hadm_id))
        .first();
      
      if (!existing) {
        await ctx.db.insert("patient_discovery", patient);
      }
    }
  },
});

export const seedLab = internalMutation({
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

export const seedLabsBatch = internalMutation({
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

export const seedLabDictionary = internalMutation({
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

export const seedPrescription = internalMutation({
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

export const seedPrescriptionsBatch = internalMutation({
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

export const seedDiagnosis = internalMutation({
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

export const seedDiagnosesBatch = internalMutation({
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

export const seedDiagnosisDictionary = internalMutation({
  args: {
    icd9_code: v.string(),
    short_title: v.string(),
    long_title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("diagnosis_dictionary", args);
  },
});

export const updateCaseEmbedding = internalMutation({
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

export const assignAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    assignee: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const history = alert.history ?? [];
    history.push({
      action: "assigned",
      user: identity.name ?? identity.email ?? "Unknown",
      timestamp: Date.now(),
      note: `Assigned to ${args.assignee}`,
    });

    await ctx.db.patch(args.alertId, {
      assignedTo: args.assignee,
      history,
    });
  },
});

export const snoozeAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const snoozedUntil = Date.now() + args.durationMinutes * 60 * 1000;
    const history = alert.history ?? [];
    history.push({
      action: "snoozed",
      user: identity.name ?? identity.email ?? "Unknown",
      timestamp: Date.now(),
      note: `Snoozed for ${args.durationMinutes} minutes`,
    });

    await ctx.db.patch(args.alertId, {
      snoozedUntil,
      history,
    });
  },
});

export const resolveAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const history = alert.history ?? [];
    history.push({
      action: "resolved",
      user: identity.name ?? identity.email ?? "Unknown",
      timestamp: Date.now(),
      note: args.note,
    });

    await ctx.db.patch(args.alertId, {
      status: "resolved",
      resolutionNote: args.note,
      history,
    });
  },
});

export const archiveAlert = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const identity = await requireAuth(ctx);
    const alert = await ctx.db.get(args.alertId);
    if (!alert) throw new Error("Alert not found");

    const history = alert.history ?? [];
    history.push({
      action: "archived",
      user: identity.name ?? identity.email ?? "Unknown",
      timestamp: Date.now(),
    });

    await ctx.db.patch(args.alertId, {
      status: "archived",
      history,
    });
  },
});
