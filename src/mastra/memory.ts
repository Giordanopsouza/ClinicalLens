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
    lastMessages: 10,
    workingMemory: { enabled: false, scope: "thread" },
  },
});
