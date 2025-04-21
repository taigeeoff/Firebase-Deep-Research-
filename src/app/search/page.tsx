"use client"
import React, { useState } from 'react';
import { Search, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import SearchSummary from '@/app/components/SearchPanel/SearchSummary';
import { useSearchSummary } from '@/hooks/useSearchSummary';

const SemanticSearchPage = () => {
  const [query, setQuery] = useState('');

  const {
    generateSummary,
    summary,
    retrievedDocs,
    isLoading,
    error,
  } = useSearchSummary();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return; // Check for empty query and/or isLoading

    try {
      await generateSummary(query);
      console.log('Search and summary initiated for:', query);
    } catch (err) {
      console.error('Error during search/summary:', err);
    }
  };

  const renderSearchResults = () => {
    // Use combined isLoading state
    if (isLoading && retrievedDocs.length === 0) { // Show loading only on initial search
      return (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-600">Searching and summarizing...</p>
        </div>
      );
    }

    // Use combined error state, only show if there's an error and no results/summary yet
    if (error && !summary && retrievedDocs.length === 0) {
      return (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      );
    }

    // Check retrievedDocs length after handling loading/error
    if (retrievedDocs.length === 0 && query && !isLoading) {
      return (
        <div className="text-center py-12 text-gray-500">
          No relevant documents found to generate a summary. Try refining your search query.
        </div>
      );
    }

    // Render using retrievedDocs and RetrievedDocument structure
    // console.log("Retrieved doc: ", retrievedDocs)

    return retrievedDocs.map((doc, index) => {
      const documentId = doc.metadata?.firestore_id as string;
      const chunkId = doc.metadata?.chunkId as string | undefined;
      const section = doc.content[0]?.text as string | undefined;
      const link = doc.metadata?.link as string | undefined;
      const snippet = doc.metadata?.snippet as string | undefined;
      const title = doc.metadata?.title as string | undefined;

      return (
        <div
          key={documentId} // Use a unique ID from metadata if available
          className="bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg"
        >
          {title && (
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {title}
            </h3>
          )}
          {/* {section && (
            <p className="text-sm text-gray-500 mb-2">
              Chunk Content: {section}
            </p>
          )} */}
          {documentId && (
            <p className="text-sm text-gray-500 mb-2">
              Document ID: {documentId}
            </p>
          )}
          {chunkId && (
            <p className="text-sm text-gray-500 mb-2">
              Chunk ID: {chunkId}
            </p>
          )}
          {snippet && (
            <p className="text-sm text-gray-500 mb-2">
              {snippet}
            </p>
          )}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-2">
              Resource Link <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GCP Documentation Search</h1>
          <p className="mt-2 text-gray-600">
            Search through indexed Google Cloud documentation using semantic search
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., How to configure automated backups in Cloud SQL?"
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>

        {/* Summary Section */}
        <SearchSummary
          summary={summary}
          isLoading={isLoading}
          error={error}
        />

        {/* Search Results */}
        <div className="space-y-6">
          {renderSearchResults()}
        </div>
      </div>
    </div>
  );
};

export default SemanticSearchPage;