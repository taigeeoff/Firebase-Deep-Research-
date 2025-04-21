import { researchFlow } from "@/lib/genkit/flows/researchFlow";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const result = await researchFlow(query);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in research API:", error);
    return NextResponse.json(
      { error: "Failed to process research query" },
      { status: 500 }
    );
  }
}