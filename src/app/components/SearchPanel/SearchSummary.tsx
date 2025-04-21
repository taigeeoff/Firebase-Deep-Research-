import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface SearchSummaryProps {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
}

const SearchSummary: React.FC<SearchSummaryProps> = ({
  summary,
  isLoading,
  error
}) => {
  if (error) {
    return (
      <div className="mb-6 border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-start gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="mb-6 border border-emerald-200 rounded-lg bg-emerald-50">
      <div className="p-4 border-b border-emerald-200 bg-emerald-100/50">
        <h3 className="text-lg font-semibold text-emerald-900">
          AI-Generated Summary
        </h3>
      </div>
      <div className="p-4">
        <div className="prose prose-emerald max-w-none">
          <p className="text-emerald-800 whitespace-pre-wrap text-sm leading-relaxed">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchSummary;