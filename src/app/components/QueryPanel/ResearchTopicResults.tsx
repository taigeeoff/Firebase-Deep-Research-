// src/app/components/QueryPanel/ResearchTopicResults.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface ResearchTopicsProps {
  tasks: Array<{
    description: string;
    context: string;
  }>;
  research: Array<{
    answer: string;
    steps: string[];
    caveats: string[];
    docReferences: Array<{ title: string; url: string }>;
  }>;
  isLoading: boolean;
}

const ResearchTopics: React.FC<ResearchTopicsProps> = ({ tasks, research, isLoading }) => {
  const [expandedTopics, setExpandedTopics] = useState<number[]>([]);

  const toggleTopic = (index: number) => {
    setExpandedTopics(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1  w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Analyzing Topics...</h2>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="flex-1  w-full">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Research Topics</h2>
          <p className="text-gray-600">
            Topics from the transcript will appear here after processing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1  w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Research Topics</h2>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className="border rounded-lg">
              <button
                onClick={() => toggleTopic(index)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 rounded-lg"
              >
                <span className="font-medium">{task.description}</span>
                {expandedTopics.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedTopics.includes(index) && research[index] && (
                <div className="px-4 py-3 border-t">
                  <div className="prose prose-sm max-w-none">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Research Findings:</h4>
                    <p className="text-gray-600 mb-3">{research[index].answer}</p>
                    
                    {research[index].steps && research[index].steps.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Implementation Steps:</h4>
                        <ul className="list-disc pl-4 mb-3">
                          {research[index].steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-gray-600">{step}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    
                    {research[index].caveats && research[index].caveats.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Important Notes:</h4>
                        <ul className="list-disc pl-4 mb-3">
                          {research[index].caveats.map((caveat, caveatIndex) => (
                            <li key={caveatIndex} className="text-gray-600">{caveat}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    
                    {research[index].docReferences && research[index].docReferences.length > 0 && (
                      <>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Documentation References:</h4>
                        <ul className="space-y-1">
                          {research[index].docReferences.map((ref, refIndex) => (
                            <li key={refIndex}>
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                              >
                                {ref.title}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchTopics;