'use server';

import { createAI, createVertexAI } from '../genkitFactory';
// import { gemini20Flash, gemini25FlashPreview0417 } from "@genkit-ai/googleai";

import { z } from "genkit";

// Create AI instance using the factory
// const ai = await createAI(gemini25FlashPreview0417);
const ai = await createVertexAI();

// Define the input schema with 'urls' and 'entityDescription' fields
const HtmlExtractionInputSchema = z.object({
    htmlContent: z.string(),
    entityDescription: z.string(),
});

export const htmlExtractionFlow = ai.defineFlow(
    {
        name: "htmlExtractionFlow",
        // Use the new input schema
        inputSchema: HtmlExtractionInputSchema,
        outputSchema: z.string()
    },
    // Update the input type annotation to match the new schema
    async (input: z.infer<typeof HtmlExtractionInputSchema>) => {

        // TODO: init html extraction prompt

        // TODO: call html extraction prompt with input params

        console.log("html extraction returned: ", text);

        return text;
    }
);