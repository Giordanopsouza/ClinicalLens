"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const searchDischargeSummaries = action({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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
