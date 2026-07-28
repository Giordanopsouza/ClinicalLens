import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { MastraAgent } from "@ag-ui/mastra";
import { clinicalCopilotAgent } from "@/src/mastra/agents/clinical-copilot";
import { safetyAuditAgent } from "@/src/mastra/agents/safety-audit";

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
  });

  return handleRequest(req);
};
