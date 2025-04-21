'use server';

import { genkit } from 'genkit';
import { genkit as genkitBeta } from "genkit/beta";
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';
// import {
//     gemini20Flash,
//     gemini25ProPreview0325,
//     gemini25FlashPreview0417,
// } from '@genkit-ai/googleai';

import { gemini20Flash, gemini25ProPreview0325, gemini25FlashPreview0417 } from '@genkit-ai/vertexai'

// import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
// import { anthropic, claude37Sonnet } from 'genkitx-anthropic';

// Define model types for better type safety
export type SupportedModel =
    | typeof gemini20Flash
    | typeof gemini25ProPreview0325
    | typeof gemini25FlashPreview0417
    // | typeof claude37Sonnet


// Factory function to create GenKit instances with specific models
export async function createAI(model: SupportedModel = gemini20Flash) {
    // enableFirebaseTelemetry();
    return genkit({
        plugins: [googleAI()],
        model,
        promptDir: './src/lib/genkit/prompts'
    });
}

// Factory function to create GenKit instances with specific models
export async function createBetaAI(model: SupportedModel = gemini20Flash) {
    // enableFirebaseTelemetry();
    return genkitBeta({
        plugins: [googleAI()],
        model,
        promptDir: './src/lib/genkit/prompts'
    });
}
export async function createVertexAI(model: SupportedModel = gemini25FlashPreview0417) {
    // enableFirebaseTelemetry();
    return genkit({
        plugins: [
          vertexAI({ location: 'us-central1' }),
        ],
        model,
        promptDir: './src/lib/genkit/prompts'
      });
      
}

// export async function createBetaAnthropicAI(model: SupportedModel) {
//     enableFirebaseTelemetry();
//     return genkitBeta({
//         plugins: [anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })],
//         model,
//         promptDir: './src/lib/genkit/prompts'
//     });
// }