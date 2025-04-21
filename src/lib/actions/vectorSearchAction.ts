'use server';

import { Firestore, VectorQuery, VectorQuerySnapshot } from "@google-cloud/firestore";
import { EmbeddingService } from '@/app/api/indexing/embedding';

// Initialize Firestore
const db = new Firestore({
    projectId: process.env.GCP_PROJECT_ID,
});

const chunksCollection = db.collection('chunks');
const embeddingService = new EmbeddingService();

interface SearchOptions {
    limit?: number;
    threshold?: number;
}

// Define the structure for the search results
interface SearchResult {
    documentId: string;
    chunkId: string;
    content: string;
    metadata?: Record<string, any>;
    score: number;
  }
  

export async function vectorSearchAction(query: string, options: SearchOptions): Promise<SearchResult[]> {
    if (!query || !query.trim()) {
        console.error('Vector search action requires a query.');
        return []; // Return empty array or throw error as appropriate
    }

    const limit = options.limit || 5; // Default limit

    try {
        console.log("Running vector search action for query:", query);
        const queryEmbeddings = await embeddingService.getEmbeddings([query]);
        const queryVector = queryEmbeddings[0];

        if (!queryVector) {
             console.error('Failed to generate embedding for the query.');
             return [];
        }

        // Configure vector search query
        const vectorQuery: VectorQuery = chunksCollection.findNearest({
            queryVector: queryVector,
            vectorField: 'embedding',
            limit: limit || 10,
            distanceMeasure: 'COSINE',
            // distanceThreshold: .5
    });

        // Execute the query
        const querySnapshot: VectorQuerySnapshot = await vectorQuery.get();

        const results = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              documentId: data.documentId,
              chunkId: data.chunkId,
              content: data.content,
              metadata: data.metadata,
              score: data.score
            };
          });

        console.log(`Found ${querySnapshot.size} results.`);

        return results;

    } catch (error) {
        console.error('Error during vector search action:', error);
        return [];
    }
}
