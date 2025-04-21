import { NextRequest, NextResponse } from 'next/server';
import { DocumentScraper } from '../indexing/scraping';
import { htmlExtractionFlow } from '@/lib/genkit/flows/htmlExtractionFlow';

const docScraper = new DocumentScraper();

export async function POST(request: NextRequest) {
  try {
    const { urls, entityDescription } = await request.json();
    // console.log("Content Extraction for: ", urls, entityDescription)

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({
        error: 'Valid URLs array is required'
      }, { status: 400 });
    }

    if (!entityDescription) {
      return NextResponse.json({
        error: 'Entity description is required'
      }, { status: 400 });
    }

    const results = await Promise.all(urls.map(async (url) => {
      try {
        // Scrape the URL
        const scrapedContent = await docScraper.scrapeUrl(url);

        const extractionResult = await htmlExtractionFlow({
          htmlContent: scrapedContent.rawHTML,
          entityDescription: entityDescription
        })

        return {
          url,
          status: 'success',
          data: extractionResult,
        };

      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
        return {
          url,
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to process URL'
        };
      }
    }));

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Content extraction error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to extract content',
      status: 'error'
    }, { status: 500 });
  }
}