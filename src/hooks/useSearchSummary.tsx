// src/hooks/useSummaryGen.tsx
import { useState } from 'react';

export interface SearchResult {
  documentId: string;
  content: string;
  metadata: {
    title?: string;
    section?: string;
  };
  score: number;
}

interface SearchOptions {
  limit?: number;
  threshold?: number;
}

interface RetrievedDocument {
  content: Record<string, any>;
  metadata?: Record<string, any>;
}

export function useSearchSummary() {
  const [summary, setSummary] = useState<string | null>(null);
  // Add state for the retrieved documents
  const [retrievedDocs, setRetrievedDocs] = useState<RetrievedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove searchResults parameter
  const generateSummary = async (query: string) => {
    // No need to check searchResults length anymore
    // if (!searchResults.length) return;

    setIsLoading(true);
    setError(null);
    setSummary(null); // Reset summary on new request
    setRetrievedDocs([]); // Reset docs on new request

    try {
      const response = await fetch('/api/search-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate summary');
      }

      // Expect { summary: string, docs: RetrievedDocument[], status: string }
      const data = await response.json();

      // Update state with both summary and docs
      setSummary(data.summary);
      setRetrievedDocs(data.docs || []); // Handle case where docs might be missing

      // Return both summary and docs
      return { summary: data.summary, docs: data.docs || [] };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
      setError(errorMessage);
      setSummary(null); // Ensure summary is null on error
      setRetrievedDocs([]); // Ensure docs are empty on error
      throw err; // Re-throw error for potential handling upstream

    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateSummary,
    summary,
    retrievedDocs, // Return the retrieved docs
    isLoading,
    error,
    setSummary,
    setRetrievedDocs, // Expose setter for docs if needed
  };
}