import { Mastra } from "@mastra/core/mastra";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { ConvexStorage, ConvexVector } from "@convex-dev/mastra/client";
import { components } from "./_generated/api";
import { action } from "./_generated/server";
import { v } from "convex/values";

const storage = new ConvexStorage(components.mastra);
const vector = new ConvexVector(components.mastra);

const memory = new Memory({
  storage,
  vector,
  options: {
    lastMessages: 40,
    semanticRecall: true,
    workingMemory: {
      scope: "thread", // Set to thread to avoid resourceId requirement
    },
    observationalMemory: {
      model: "google/gemini-2.5-flash",
    },
  },
});

const clinicalCopilotAgent = new Agent({
  id: "clinicalCopilotAgent",
  name: "Clinical Copilot",
  instructions: `You are Project Aegis, an advanced clinical copilot designed to help healthcare professionals analyze patient data and explore treatment guidelines. Always ground your analysis in the actual patient data. REMINDER: You are a decision support tool, not a substitute for professional medical judgment.`,
  model: "google/gemini-2.5-flash",
  memory,
});

export const mastra = new Mastra({
  storage,
  agents: [clinicalCopilotAgent],
});

// ─── Entry Point for CopilotKit ──────────────────────────────────
export const chat = action({
  args: {
    message: v.string(),
    threadId: v.optional(v.string()),
    hadm_id: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // IMPORTANT: Inject context into adapters
    storage.setCtx(ctx);
    vector.setCtx(ctx);

    const agent = mastra.getAgent("clinicalCopilotAgent");
    
    // Process the chat via Mastra using updated Memory API
    const response = await agent.generate(args.message, {
      memory: {
        thread: args.threadId,
        resource: args.hadm_id ? `patient-${args.hadm_id}` : "global-clinical-lens",
      },
    });

    return response;
  },
});
