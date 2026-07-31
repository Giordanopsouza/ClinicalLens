import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";
import { MastraAgent } from "@ag-ui/mastra";
import { clinicalCopilotAgent } from "@/src/mastra/agents/clinical-copilot";
import { safetyAuditAgent } from "@/src/mastra/agents/safety-audit";
import { auth } from "@clerk/nextjs/server";
import { RequestContext } from "@mastra/core/request-context";

const serviceAdapter = new ExperimentalEmptyAdapter();

export const POST = async (req: NextRequest) => {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });

  const requestContext = new RequestContext();
  if (token) {
    requestContext.set("convexToken", token);
  }

  // Forward the active patient ID from the frontend header so tools can use it
  const hadmIdHeader = req.headers.get("x-hadm-id");
  if (hadmIdHeader) {
    const parsed = parseInt(hadmIdHeader, 10);
    if (!isNaN(parsed)) {
      requestContext.set("activeHadmId", parsed);
    }
  }

  const runtime = new CopilotRuntime({
    // Use an object for agents to ensure keys are used as IDs for frontend discovery
    agents: {
      clinicalCopilotAgent: new MastraAgent({ 
        agent: clinicalCopilotAgent,
        resourceId: "clinicalCopilotAgent",
        requestContext,
      }),
      safetyAuditAgent: new MastraAgent({ 
        agent: safetyAuditAgent,
        resourceId: "safetyAuditAgent",
        requestContext,
      }),
    },
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
