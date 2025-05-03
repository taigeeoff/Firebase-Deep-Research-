// src/app/api/a2a/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { A2AError } from '@/lib/a2aServerMod/server/error';
import * as schema from '@/lib/a2aServerMod/schema'; // Adjust import path
import { A2AServer } from '@/lib/a2aServerMod/server/nextjsHandler';
import { movieAgentHandler } from './aaronQaHandler';

const movieAgentCard: schema.AgentCard = {
    name: "Movie Agent",
    description:
        "An agent that can answer questions about movies and actors using TMDB.",
    url: "http://localhost:41241", // Default port used in the script
    provider: {
        organization: "A2A Samples",
    },
    version: "0.0.1",
    capabilities: {
        // Although it yields multiple updates, it doesn't seem to implement full A2A streaming via TaskYieldUpdate artifacts
        // It uses Genkit streaming internally, but the A2A interface yields start/end messages.
        // State history seems reasonable as it processes history.
        streaming: false,
        pushNotifications: false,
        stateTransitionHistory: true,
    },
    authentication: null,
    defaultInputModes: ["text"],
    defaultOutputModes: ["text"],
    skills: [
        {
            id: "general_movie_chat",
            name: "General Movie Chat",
            description:
                "Answer general questions or chat about movies, actors, directors.",
            tags: ["movies", "actors", "directors"],
            examples: [
                "Tell me about the plot of Inception.",
                "Recommend a good sci-fi movie.",
                "Who directed The Matrix?",
                "What other movies has Scarlett Johansson been in?",
                "Find action movies starring Keanu Reeves",
                "Which came out first, Jurassic Park or Terminator 2?",
            ],
        },
        // The specific tools are used internally by the Genkit agent,
        // but from the A2A perspective, it exposes one general chat skill.
    ],
};

const a2aInterface: A2AServer = new A2AServer(
    movieAgentHandler,
    { card: movieAgentCard }
);

export async function POST(request: NextRequest): Promise<NextResponse> {
    let requestBody: any;
    let taskId: string | undefined;
    let requestId: string | number | null = null; // JSON-RPC request ID

    try {        
        requestBody = await request.json();
        requestId = requestBody?.id ?? null; // Get JSON-RPC ID early

        console.log("Incoming Request body: ", requestBody)

        // Basic JSON-RPC structure check (reuse or adapt isValidJsonRpcRequest)
        if (!isValidJsonRpcRequest(requestBody)) { // Assuming you extract/adapt this function
            throw A2AError.invalidRequest(`A2A ERROR: Request invalid - Request receive: ${JSON.stringify(requestBody)}`);
        }

        // Extract potential task ID for error context
        taskId = (requestBody.params as any)?.id;

        // Call the core processing logic (extracted from A2AServer.endpoint)
        let responsePayload: any;
        switch (requestBody.method) {
            case "tasks/send":
                responsePayload = await a2aInterface.handleTaskSend(requestBody, new NextResponse());
                break;
            case "tasks/get":
                responsePayload = await a2aInterface.handleTaskGet(requestBody, new NextResponse());
                break;
            case "tasks/cancel":
                responsePayload = await a2aInterface.handleTaskCancel(requestBody, new NextResponse());
                break;
            default:
                throw A2AError.methodNotFound(requestBody.method);
        }

        // const responsePayload = await a2aInterface.handleTaskSend(requestBody);

        // Return the successful JSON-RPC response
        return NextResponse.json(responsePayload);

    } catch (error: any) {
        // Normalize the error and add task ID context if needed
        if (error instanceof A2AError && taskId && !error.taskId) {
            error.taskId = taskId;
        }
        const normalizedError = a2aInterface.normalizeError(error, requestId); // Adapt normalizeError

        // Determine appropriate HTTP status code from the A2AError type
        // const status = mapA2AErrorToHttpStatus(error); // You'll need to create this mapping

        // Return the JSON-RPC error response
        return NextResponse.json(normalizedError);
    }
}

// --- Helper functions (to be created/adapted) ---

function isValidJsonRpcRequest(body: any): boolean {
    // Implement the logic from A2AServer.isValidJsonRpcRequest
    return typeof body === 'object' && body !== null &&
        body.jsonrpc === '2.0' &&
        typeof body.method === 'string' &&
        typeof body.params === 'object' && // Or array, adapt as needed
        (body.id !== undefined || body.id === null); // JSON-RPC ID can be string, number, or null
} 

// Add CORS headers if not configured globally in next.config.js
// You might need an OPTIONS handler as well for preflight requests
export async function OPTIONS(request: NextRequest) {
    // Define allowed origins, methods, headers
    const headers = {
        'Access-Control-Allow-Origin': '*', // Or specific origins
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Add other headers if needed
    };
    return new NextResponse(null, { status: 204, headers });
}
