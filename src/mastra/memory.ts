import { Memory } from "@mastra/memory";

export const memory = new Memory({
  // Storage removed for Vercel deployment to avoid "Unable to open connection to local database" error.
  // Defaults to in-memory storage which is compatible with serverless environments.
  options: {
    lastMessages: 40,
    workingMemory: { enabled: true, scope: "thread" },
    observationalMemory: { model: "google/gemini-2.5-flash" },
  },
});
