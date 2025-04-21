import { z } from 'genkit';
import type { Genkit } from 'genkit';
import { Document } from 'genkit/retriever';
import { vectorSearchAction } from '@/lib/actions/vectorSearchAction';

// Export a factory function to create the firebaseVectorSearch retriever
export async function createSimpleFirestoreVSRetriever(ai: Genkit) {
    return ai.defineSimpleRetriever(
        {
            name: "simpleFirestoreVSRetriever",
            configSchema: z.object({
                limit: z.number().optional().default(5),
            }).optional(),
            // Specify how to get the main text content from the Document object
            content: (doc: Document) => doc.text,
            // Specify how to get metadata from the Document object
            metadata: (doc: Document) => ({ ...doc.metadata }), // Include all metadata from the action
        },
        async (query, config) => {
            console.log(`Using firebaseVectorSearch retriever for query: "${query.text}" with config:`, config);
            // Call the server action directly, passing the query text and options
            const results = await vectorSearchAction(query.text, { limit: config?.limit });

            // Map Firestore documents to Genkit Document format
            const resultDocs: Document[] = results.map(doc => {
                return Document.fromText(
                    doc.content || '', {
                    firestore_id: doc.documentId,
                    chunkId: doc.chunkId
                });
            });

            console.log('Found Documents during simple search: ', resultDocs)

            return resultDocs;
        }
    );
}