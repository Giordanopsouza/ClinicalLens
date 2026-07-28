import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const memory = new Memory({
  storage: new LibSQLStore({
    id: "clinical-lens-memory",
    url: "file:./clinical-lens.db",
  }),
  options: {
    lastMessages: 40,
    workingMemory: { enabled: true, scope: "thread" },
    observationalMemory: { model: "google/gemini-2.5-flash" },
    // semanticRecall omitted — requires a vector DB; add later if needed
  },
});
