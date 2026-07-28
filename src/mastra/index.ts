import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";
import { clinicalCopilotAgent } from "./agents/clinical-copilot";
import { safetyAuditAgent } from "./agents/safety-audit";

export const mastra = new Mastra({
  agents: { clinicalCopilotAgent, safetyAuditAgent },
  server: {
    cors: {
      origin: "*",
      allowMethods: ["*"],
      allowHeaders: ["*"],
    },
    apiRoutes: [
      registerCopilotKit({
        path: "/copilotkit",
        resourceId: "clinicalCopilotAgent",
      }),
    ],
  },
});
