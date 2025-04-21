// src/app/api/process-transcript/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transcriptToEmailFlow } from "@/lib/genkit/flows/transcriptToEmailFlow";
import { z } from "zod";

// Input validation schema
const RequestSchema = z.object({
    transcript: z.string().min(1, "Transcript is required"),
});

export async function POST(request: NextRequest) {
    console.log("Processing transcript request...");
    try {

        // Parse and validate request
        const body = await request.json();
        const { transcript } = RequestSchema.parse(body);
        
        // Process transcript
        const result = await transcriptToEmailFlow(transcript)
        
        return NextResponse.json({
            success: true,
            data: {
                tasks: result.tasks,
                email: result.email,
                research: result.research,
            },
        });

    } catch (error) {
        console.error("Error processing transcript:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: "Invalid input",
                details: error.errors,
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        }, { status: 500 });
    }
}