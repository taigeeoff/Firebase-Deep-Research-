// src/app/api/indexing/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCollection, uploadDocumentBatch } from '@/lib/Firebase/Firestore';
import {
  DocumentFields,
  UploadResponse,
  DocumentStatus,
  InputURLValidator,
  DocumentIdGenerator,
  BatchConfig,
} from '@/lib/Firebase/types';
import { DocumentProcessor } from './processing';


/**
 * Document ID generator that converts GCP URLs to document IDs
 */
const gcpURLDocumentIdGenerator: DocumentIdGenerator = (url: string, index: number = 0) => {
  return url
    .replace('https://cloud.google.com/', '')
    .replace(/\//g, '-')
    .replace(/-+$/, '');
};

/**
 * Validates a GCP documentation URL
 */
const validateGcpDocUrl: InputURLValidator = (url: string): boolean => {
  console.log('validating' + url)
  return url.startsWith('https://cloud.google.com/') &&
    url !== 'https://cloud.google.com/';
};

/**
 * Document ID generator that converts URLs to document IDs
 */
const documentIdGenerator: DocumentIdGenerator = (url: string, index: number = 0) => {
  try {
    // Parse the URL to extract meaningful parts
    const urlObj = new URL(url);
    
    // Combine hostname and pathname for the ID
    let id = `${urlObj.hostname}${urlObj.pathname}`
      .replace(/^www\./, '')         // Remove www prefix
      .replace(/\.[^/.]+$/, '')      // Remove file extensions
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with hyphens
      .toLowerCase()                  // Convert to lowercase
      .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '')       // Remove leading/trailing hyphens
      .slice(0, 100);                // Limit length while preserving uniqueness

    // Add index if provided (for handling duplicate URLs)
    if (index > 0) {
      id = `${id}-${index}`;
    }

    return id;
  } catch (error) {
    console.error('Error generating document ID:', error);
    // Fallback to timestamp-based ID if URL processing fails
    return `doc-${Date.now()}-${index}`;
  }
};

/**
 * Validates a documentation URL
 */
const validateDocUrl: InputURLValidator = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Ensure URL has a valid protocol and hostname
    return urlObj.protocol === 'https:' && urlObj.hostname.length > 0;
  } catch {
    return false;
  }
};

/**
 * Define Document Processor
 */
const documentProcessor = new DocumentProcessor();


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.urls || !Array.isArray(body.urls)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format'
      }, { status: 400 });
    }

    const batchConfig: BatchConfig<DocumentFields> = {
      colId: 'documents',
      batchSize: 500,
      baseFields: {
        status: 'pending' as DocumentStatus
      }
    };

    // Step 1: Upload documents to Firestore
    const uploadResponse: UploadResponse<DocumentFields> = await uploadDocumentBatch<DocumentFields>(
      body.urls,
      batchConfig,
      documentIdGenerator,
      validateDocUrl
    );

    if (!uploadResponse.success) {
      return NextResponse.json({
        success: false,
        error: uploadResponse.error || 'Failed to upload documents',
        failedUploads: uploadResponse.failedUploads
      }, { status: 500 });
    }

    // Step 2: Process each document (chunk and embed)
    const processingPromises = uploadResponse.documents.map(doc =>
      documentProcessor.processDocument(doc, body.extractedContent)
        .catch(error => {
          console.error(`Failed to process document ${doc.id}:`, error);
          return error;
        })
    );

    Promise.all(processingPromises);

    return NextResponse.json({
      success: true,
      message: `Started processing ${uploadResponse.documents.length} documents`,
      documents: uploadResponse.documents,
      failedUploads: uploadResponse.failedUploads
    });

  } catch (error) {
    console.error('Error in indexing route:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


// GET route to fetch all docs in Firebase Storage
export async function GET() {
  try {
    // console.log('fetch called')

    const documents = await getCollection("documents")

    // console.log('Docs in storage fetched: ' + documents)

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}