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
    const results = await ctx.vectorSearch("clinical_cases", "by_embedding", {
      vector: args.embedding,
      limit: args.limit ?? 5,
    });

    const docs = await Promise.all(
      results.map(async (result) => {
        const doc = await ctx.runQuery(internal.queries.getPatientByDocId, {
          id: result._id,
        });
        return { ...doc, score: result._score };
      })
    );

    return docs;
  },
});
