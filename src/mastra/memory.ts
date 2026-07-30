import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

const databaseUrl = process.env.NODE_ENV === 'production' 
  ? "file:/tmp/clinical-lens.db" 
  : "file:./clinical-lens.db";

export const memory = new Memory({
  storage: new LibSQLStore({
    id: "clinical-lens-memory",
    url: databaseUrl,
  }),
  options: {
    lastMessages: 40,
    workingMemory: { enabled: true, scope: "thread" },
    observationalMemory: { model: "google/gemini-2.5-flash" },
  },
});
