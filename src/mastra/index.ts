import { Mastra } from "@mastra/core/mastra";
import { registerCopilotKit } from "@ag-ui/mastra/copilotkit";

// Agents will be imported here in Phase 2
// import { clinicalCopilotAgent } from "./agents/clinical-copilot";

export const mastra = new Mastra({
  // agents: { clinicalCopilotAgent },
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
