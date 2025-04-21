// src/app/api/indexing/embedding.ts
import { createAI, createVertexAI } from '@/lib/genkit/genkitFactory';
// import { gemini20Flash, textEmbedding004 } from "@genkit-ai/googleai";
import { textEmbedding005 } from '@genkit-ai/vertexai';

// const aiplatform = require('@google-cloud/aiplatform');

const ai = await createVertexAI();

export class EmbeddingService {
  /**
   * Generate embeddings for multiple texts using Genkit
   */
  async getEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      // Create an array of promises, where each promise resolves to an embedding response
      const embeddingPromises = texts.map(text =>
        ai.embed({
          embedder: textEmbedding005,
          content: { content: [{ text }] },
        })
      );

      // Wait for all embedding requests to complete concurrently
      const responses = await Promise.all(embeddingPromises);

      // Extract the embedding vector from each response object
      const embeddings = responses.map(response => response[0].embedding);

      return embeddings;

    } catch (error) {
      console.error('Error generating embeddings with Genkit:', error);
      throw new Error(`Genkit embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}