"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { ActionCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Helper to check authentication
async function requireAuth(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call. Please sign in.");
  }
  return identity;
}

export const populateDiscoveryTable = action({
  args: {},
  handler: async (ctx) => {
    // This is an internal utility to populate the lightweight discovery table.
    // We fetch clinical cases in small chunks to avoid memory limits.
    let cursor = null;
    let totalSynced = 0;

    while (true) {
      const result: { page: Array<{ hadm_id: number; subject_id: number; admission_diagnosis?: string; gender: string; age: number }>; continueCursor: string; isDone: boolean } = await ctx.runQuery(internal.queries.getPatientListInternal, {
        paginationOpts: {
          numItems: 100,
          cursor: cursor,
        },
      });

      if (result.page.length === 0) break;

      await ctx.runMutation(internal.mutations.syncDiscoveryMetadata, {
        patients: result.page.map(p => ({
          hadm_id: p.hadm_id,
          subject_id: p.subject_id,
          admission_diagnosis: p.admission_diagnosis,
          gender: p.gender,
          age: p.age,
        }))
      });

      totalSynced += result.page.length;
      cursor = result.continueCursor;
      if (result.isDone) break;
    }

    return { totalSynced };
  },
});

export const searchDischargeSummaries = action({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<Doc<"clinical_cases"> & { score: number }>> => {
    await requireAuth(ctx);

    const limit = Math.min(Math.max(args.limit ?? 5, 1), 20);
    const matches = await ctx.vectorSearch("clinical_cases", "by_embedding", {
      vector: args.embedding,
      limit,
    });

    const hydrated = await Promise.all(
      matches.map(async (match) => {
        const clinicalCase: Doc<"clinical_cases"> | null = await ctx.runQuery(internal.queries.getPatientByDocId, {
          id: match._id,
        });

        if (!clinicalCase) {
          return null;
        }

        return {
          ...clinicalCase,
          score: match._score,
        };
      }),
    );

    return hydrated.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});
