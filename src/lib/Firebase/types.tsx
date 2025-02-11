// src/lib/Firebase/types.tsx

import { FieldValue, VectorValue, Timestamp } from "@google-cloud/firestore";
/**
 * Common fields interface for all Firestore documents
 */
export interface BaseFields {
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

/**
 * Possible document processing statuses
 */
export type DocumentStatus = 'pending' | 'indexed' | 'failed' | 'processing';

/**
 * Base document interface for documentation entries
 */
export interface DocumentFields extends BaseFields {
    url: string;
    status: DocumentStatus;
    content?: string;
    rawHTML?: string;
    indexedAt: null | Timestamp;
    error?: string;
}

/**
 * Base chunk interface for document chunks
 */
export interface ChunkFields extends BaseFields {
    documentId: string;
    chunkId: string,
    content: string;
    context?: string;
    embedding?: VectorValue;
    chunkIndex?: number;
    totalChunks?: number;
}

/**
 * Response interface for upload operations
 */
export interface UploadResponse<T extends BaseFields> {
    success: boolean;
    documents: Array<{
        id: string;
        data: T;
    }>;
    error?: string;
    failedUploads?: FailedUpload[];
}

/**
 * Interface for failed upload entries
 */
export interface FailedUpload {
    url: string;
    error: string;
}

/**
 * Type for document ID generator function
 * - input: Can be a string or object containing necessary information
 * - options: Optional configuration for ID generation
 */
export type DocumentIdGenerator = (id: string, index: number) => string;


/**
 * Type for input url validator function
 */
export type InputURLValidator = (url: string) => boolean;

/**
 * Configuration interface for batch operations
 */
export interface BatchConfig<T extends BaseFields> {
    colId?: string;
    batchSize?: number;
    baseFields?: Partial<T>;
}