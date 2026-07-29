import { NextRequest, NextResponse } from "next/server";
import { tavilyResearchTool } from "@/src/mastra/tools/tavily-research";

export async function POST(req: NextRequest) {
  try {
    const { query, icd9_code } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const results = await tavilyResearchTool.execute!(
      {
        query,
        icd9_code,
        search_depth: "advanced",
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Research tool error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
