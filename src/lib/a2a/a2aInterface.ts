// src/app/api/a2a/route.ts
import * as schema from '@/lib/a2aServerMod/schema'; // Adjust import path
import { A2AServer } from '@/lib/a2aServerMod/server/nextjsHandler';
import { virtualCustomerEngineerHandler } from './aaronQaHandler';

export const virtualCustomerEngineerCard: schema.AgentCard = {
    name: "Virtual Customer Engineer",
    description:
        "An agent that can answer answer technical questions about GCP tooling and architecture",
    url: "https://ce-intern-fe-service-608484279995.europe-west1.run.app/api/a2a",
    provider: {
        organization: "Jakob Pörschmann @ Google",
    },
    version: "0.0.1",
    capabilities: {
        streaming: false,
        pushNotifications: false,
        stateTransitionHistory: true,
    },
    authentication: null,
    defaultInputModes: ["text"],
    defaultOutputModes: ["text"],
    skills: [
        {
            id: "gcp_questions",
            name: "Technical GCP Architecture and Tooling Questions",
            description:
                "Answer technical GCP Architecture, design decision, and tooling questions. Provide sample code.",
            tags: ["gcp", "architecture", "code", "cloud", "serverless"],
            examples: [
                "How do I get started with Gemini via Vertex AI in Python?",
                "How do I host my ADK agent on GCP?",
                "How do I scale my web application on Cloud Run?",
                "Which Database should I use for my text embeddings?"
            ],
        },
    ],
};

export const a2aInterface: A2AServer = new A2AServer(
    virtualCustomerEngineerHandler,
    { card: virtualCustomerEngineerCard }
);