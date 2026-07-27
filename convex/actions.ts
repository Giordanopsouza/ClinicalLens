"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Helper to check authentication
async function requireAuth(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated call. Please sign in.");
  }
  return identity;
}

export const searchDischargeSummaries = action({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    const limit = Math.min(Math.max(args.limit ?? 5, 1), 20);
    const matches = await ctx.vectorSearch("clinical_cases", "by_embedding", {
      vector: args.embedding,
      limit,
    });

    const hydrated = await Promise.all(
      matches.map(async (match) => {
        const clinicalCase = await ctx.runQuery(internal.queries.getPatientByDocId, {
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
