import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { MastraAgent } from "@ag-ui/mastra";
import { clinicalCopilotAgent } from "@/src/mastra/agents/clinical-copilot";
import { safetyAuditAgent } from "@/src/mastra/agents/safety-audit";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  // Use an object for agents to ensure keys are used as IDs for frontend discovery
  agents: {
    clinicalCopilotAgent: new MastraAgent({ 
      agent: clinicalCopilotAgent as any 
    }),
    safetyAuditAgent: new MastraAgent({ 
      agent: safetyAuditAgent as any 
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
    // Delegate actual execution to Convex action
    process: async ({ messages, threadId }) => {
      try {
        const response = await convex.action(api.mastra.chat, {
          message: messages[messages.length - 1].content,
          threadId,
        });
        return { content: response.text };
      } catch (error: any) {
        console.error("Convex Delegation Error:", error);
        return { content: "Error: Clinical intelligence is temporarily unavailable." };
      }
    }
  });

  return handleRequest(req);
};
