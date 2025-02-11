// src/app/api/indexing/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/Firebase/FirebaseConfig';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    writeBatch, 
    doc,
    DocumentReference
} from 'firebase/firestore';


const BATCH_SIZE = 100; // Firestore recommends keeping batches under 500 operations

async function deleteInBatches(chunksToDelete: string[], documentId: string) {
    // Process chunks in batches
    for (let i = 0; i < chunksToDelete.length; i += BATCH_SIZE) {
        const batch = db.batch();
        
        // Get current batch of chunks
        const currentBatchChunks = chunksToDelete.slice(i, i + BATCH_SIZE);
        
        // Add chunk deletions to current batch
        currentBatchChunks.forEach(chunkId => {
            const chunkRef = db.collection('chunks').doc(chunkId);
            batch.delete(chunkRef);
        });

        // If this is the last batch and there's room, include the main document deletion
        const isLastBatch = i + BATCH_SIZE >= chunksToDelete.length;
        const hasRoomInBatch = currentBatchChunks.length < BATCH_SIZE;
        
        if (isLastBatch && hasRoomInBatch) {
            const docRef = db.collection('documents').doc(documentId);
            batch.delete(docRef);
        }

        // Commit current batch
        await batch.commit();
        
        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // If the document wasn't deleted in the last chunk batch, delete it separately
    if (chunksToDelete.length % BATCH_SIZE === 0) {
        const finalBatch = db.batch();
        const docRef = db.collection('documents').doc(documentId);
        finalBatch.delete(docRef);
        await finalBatch.commit();
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    const id = params.id;

    if (!id) {
        return NextResponse.json(
            { success: false, error: 'Document ID is required' },
            { status: 400 }
        );
    }

    try {
        // Create query for chunks
        const chunksSnapshot = await db.collection('chunks')
            .where('documentId', '==', id)
            .get();
        
        // Get array of chunk IDs
        const chunkIds = chunksSnapshot.docs.map(doc => doc.id);
        
        // Log the number of chunks being deleted
        console.log(`Deleting document ${id} with ${chunkIds.length} chunks`);

        // Process deletions in batches
        await deleteInBatches(chunkIds, id);

        return NextResponse.json({ 
            success: true,
            deletedChunks: chunkIds.length
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                // code: error?.code
            },
            { status: 500 }
        );
    }
}