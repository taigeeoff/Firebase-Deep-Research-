'use server';

import { createAI, createVertexAI } from '../genkitFactory';
// import { gemini20Flash, gemini25FlashPreview0417} from "@genkit-ai/googleai";
import { createSimpleFirestoreVSRetriever } from '../retriever/simpleSearchRetriever';
import { z } from "genkit";

// Create AI instance using the factory
// const ai = await createAI(gemini25FlashPreview0417);
const ai = await createVertexAI();

// Create Receivers
const firesoreVsRetriever = await createSimpleFirestoreVSRetriever(ai);

// Define the simple search flow using the retriever
export const simpleSearchFlow = ai.defineFlow(
  {
    name: "simpleSearchFlow",
    inputSchema: z.string(), // Takes a text query as input
    outputSchema: z.object({
      summary: z.string(),
      docs: z.array(z.object({
        content: z.array(z.any()).optional(),
        metadata: z.record(z.string(), z.any()).optional()
      }))
    }),
  },
  async (queryText) => {
    console.log("Executing simpleSearchFlow with query:", queryText);

    // 1. Retrieve relevant documents using the Firebase vector search retriever
    const docs = await ai.retrieve({
      retriever: firesoreVsRetriever,
      query: queryText,
      options: { limit: 10 }
    });

    console.log("Retrieved documents:", docs.length);

    // 2. Generate a response using the LLM based on the query and retrieved context
    const qaSummaryPrompt = ai.prompt('qaSummary');

    const { text } = await qaSummaryPrompt(
      {
        question: queryText
      },
      {
        docs
      }
    );

    return { summary: text, docs: docs };
  }
);