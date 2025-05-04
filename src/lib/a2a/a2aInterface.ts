// src/app/api/a2a/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { A2AError } from '@/lib/a2aServerMod/server/error';
import * as schema from '@/lib/a2aServerMod/schema'; // Adjust import path
import { A2AServer } from '@/lib/a2aServerMod/server/nextjsHandler';
import { movieAgentHandler } from './aaronQaHandler';

export const movieAgentCard: schema.AgentCard = {
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

export const a2aInterface: A2AServer = new A2AServer(
    movieAgentHandler,
    { card: movieAgentCard }
);