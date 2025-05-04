import {
    CommonRetrieverOptionsSchema,
    Document, // Import Document directly
} from 'genkit/retriever';
import { z } from 'genkit';
import type { Genkit } from 'genkit';
import fetch from 'node-fetch';
import { scrapeUrlAction } from '@/lib/actions/scraperAction';

// Update this schema to include necessary Google Custom Search parameters
const customSearchRetrieverOptionsSchema = CommonRetrieverOptionsSchema.extend({
    k: z.number().optional().default(10),
});

// Define interface for search result items
interface SearchResultItem {
    link?: string;
    title?: string;
    snippet?: string;
    displayLink?: string;
}

// Define interface for the Google Custom Search API response
interface GoogleSearchResponse {
  items?: SearchResultItem[];
  error?: {
    message?: string;
  };
}


interface CleanedSearchResultItem {
    cleanedHtmlContent: string;
    link: string; // Keep link as required here
    title?: string;
    snippet?: string;
    displayLink?: string;
}

// Export a factory function to create the custom search retriever
export async function createCustomSearchRetriever(ai: Genkit) {
    return ai.defineSimpleRetriever(
        {
            name: `customSearchRetriever`,
            configSchema: customSearchRetrieverOptionsSchema,
            content: (doc: Document) => doc.text,
            metadata: (doc: Document) => ({ ...doc.metadata }),
        },
        async (input, options) => {
            const query = encodeURIComponent(typeof input === 'object' && input.text ? input.text : String(input));
            const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.CUSTOM_SEARCH_API_KEY}&cx=${process.env.CUSTOM_SEARCH_ENGINE_ID}&q=${query}`;

            try {
                const response = await fetch(searchUrl);
                const data = await response.json() as GoogleSearchResponse;

                if (!response.ok) {
                    console.error('Google Search API error:', data);
                    throw new Error(`Search API returned error: ${data.error?.message || response.statusText}`);
                }

                const results = data.items || [];
                const topKResults = results.slice(0, options.k);

                // Filter results to only include those with a link *before* mapping
                const resultsWithLinks = topKResults.filter((item): item is SearchResultItem & { link: string } => typeof item.link === 'string');

                // Fetch content for each result with a link
                const cleanedResults: CleanedSearchResultItem[] = await Promise.all(
                    resultsWithLinks.map(async (item) => { // item.link is now guaranteed to be a string
                        let cleanedHtmlContent = '';
                        try {
                            console.log(`Fetching content from: ${item.link}`);
                            const scraperResult = await scrapeUrlAction(item.link);
                            cleanedHtmlContent = scraperResult.cleanHTML;
                        } catch (error) {
                            console.error(`Error fetching content from ${item.link}:`, error);
                            // Decide how to handle scraping errors - perhaps return default content or skip
                            cleanedHtmlContent = `Error scraping content: ${error instanceof Error ? error.message : String(error)}`;
                        }

                        // Construct the CleanedSearchResultItem - item.link is string here
                        return {
                            link: item.link, // Now guaranteed to be string
                            title: item.title,
                            snippet: item.snippet,
                            displayLink: item.displayLink,
                            cleanedHtmlContent: cleanedHtmlContent || '', // Ensure cleanedHtmlContent is always a string
                        };
                    })
                );

                // Map cleaned results to Genkit Documents
                const resultDocs: Document[] = cleanedResults.map(item => {
                    // Use cleaned content first, fallback to snippet/title
                    const content = item.cleanedHtmlContent || item.snippet || item.title || 'Content unavailable';
                    return Document.fromText(
                        content,
                        { // Metadata
                            title: item.title,
                            snippet: item.snippet,
                            link: item.link,
                            displayLink: item.displayLink,
                            // Indicate if scraping failed within metadata?
                            ...(item.cleanedHtmlContent.startsWith('Error scraping content:') && { scrapingError: item.cleanedHtmlContent }),
                        }
                    );
                });

                return resultDocs;
            } catch (error) {
                console.error('Error searching Google API:', error);
                throw error;
            }
        }
    );
}
