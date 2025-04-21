"use client";

import { useState } from "react";
import { researchFlow } from "@/lib/genkit/flows/researchFlow";

export default function CustomSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Replace direct flow call with API call
      const response = await fetch('/api/custom-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setResult(data.result);
    } catch (error) {
      console.error("Error in search:", error);
      setResult("Sorry, an error occurred while processing your search.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">GCP Research Assistant</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about Google Cloud Platform..."
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="flex justify-center my-6">
          <div className="animate-pulse">Loading results...</div>
        </div>
      )}

      {result && !isLoading && (
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
}