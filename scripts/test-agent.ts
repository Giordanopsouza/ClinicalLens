import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { clinicalCopilotAgent } from "../src/mastra/agents/clinical-copilot";

async function main() {
  console.log("Testing agent with query: 'what is the latest news around cancer'");
  
  const result = await clinicalCopilotAgent.generate("what is the latest news around cancer", {
    memory: {
      thread: "test-thread-" + Date.now(),
      resource: "test-resource"
    }
  });
  
  console.log("--- Agent Response ---");
  console.log(result.text);
  console.log("--- Tool Calls ---");
  console.log(JSON.stringify(result.toolCalls, null, 2));
  console.log("--- Tool Results ---");
  console.log(JSON.stringify(result.toolResults, null, 2));
}

main().catch(console.error);
