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

// Using object format and passing explicit IDs to the adapter
const runtime = new CopilotRuntime({
  agents: {
    clinicalCopilotAgent: new MastraAgent({ 
      id: "clinicalCopilotAgent",
      agent: clinicalCopilotAgent as any 
    }),
    safetyAuditAgent: new MastraAgent({ 
      id: "safetyAuditAgent",
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
