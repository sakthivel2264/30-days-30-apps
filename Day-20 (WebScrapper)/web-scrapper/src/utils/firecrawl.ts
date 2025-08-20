/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ScrapeData, ScrapeOptions, CrawlResult } from '../types';

const API_KEY = import.meta.env.VITE_FIRECRAWL_API_KEY;
const BASE_URL = 'https://api.firecrawl.dev/v1';

if (!API_KEY) {
  console.warn('Firecrawl API key not found. Please add VITE_FIRECRAWL_API_KEY to your .env file');
}

export async function scrapeUrl(url: string, options: ScrapeOptions): Promise<ScrapeData> {
  try {
    // Validate URL
    new URL(url);
    
    const response = await fetch(`${BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        url,
        formats: options.formats,
        includeTags: options.includeTags,
        excludeTags: options.excludeTags,
        onlyMainContent: options.onlyMainContent,
        waitFor: options.waitFor
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to scrape URL');
    }

    // Extract links from markdown content
    const links: any[] = [];
    if (data.data?.markdown) {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(data.data.markdown)) !== null) {
        links.push({
          text: match[1],
          href: match[2]
        });
      }
    }

    // Handle metadata properly
    const processedMetadata = data.data?.metadata ? {
      ...data.data.metadata,
      keywords: Array.isArray(data.data.metadata.keywords) 
        ? data.data.metadata.keywords.join(', ')
        : data.data.metadata.keywords
    } : {};

    return {
      url,
      title: data.data?.metadata?.title || 'Untitled',
      markdown: data.data?.markdown || '',
      html: data.data?.html || '',
      screenshot: data.data?.screenshot || '',
      links: links.slice(0, 20), // Limit to first 20 links
      metadata: processedMetadata,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown scraping error');
  }
}

export async function crawlWebsite(
  url: string, 
  options: { limit?: number; includePaths?: string[]; excludePaths?: string[] }
): Promise<CrawlResult> {
  try {
    new URL(url);
    
    const response = await fetch(`${BASE_URL}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        url,
        limit: options.limit || 10,
        includePaths: options.includePaths || [],
        excludePaths: options.excludePaths || [],
        scrapeOptions: {
          formats: ['markdown', 'html'],
          onlyMainContent: true,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to crawl website');
    }

    const processedData: ScrapeData[] = data.data?.map((item: any) => {
      const processedMetadata = item.metadata ? {
        ...item.metadata,
        keywords: Array.isArray(item.metadata.keywords) 
          ? item.metadata.keywords.join(', ')
          : item.metadata.keywords
      } : {};

      return {
        url: item.metadata?.sourceURL || url,
        title: item.metadata?.title || 'Untitled',
        markdown: item.markdown || '',
        html: item.html || '',
        metadata: processedMetadata,
        timestamp: new Date().toISOString(),
      };
    }) || [];

    return {
      success: true,
      data: processedData,
      totalPages: processedData.length,
    };
  } catch (error) {
    console.error('Crawling error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown crawling error',
    };
  }
}

// Simple scraping function
export async function scrapeUrlSimple(url: string): Promise<ScrapeData> {
  return scrapeUrl(url, {
    formats: ['markdown', 'html'],
    onlyMainContent: true,
    waitFor: 3000
  });
}

// Map extraction function for structured data
export async function mapUrl(url: string, schema: any): Promise<any> {
  try {
    new URL(url);
    
    const response = await fetch(`${BASE_URL}/map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        url,
        schema
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to map URL');
    }

    return data.data;
  } catch (error) {
    console.error('Mapping error:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown mapping error');
  }
}

export function extractMainContent(markdown: string): string {
  if (!markdown) return '';
  
  // Remove excessive whitespace and normalize
  const content = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Extract main headings and paragraphs
  const lines = content.split('\n');
  const mainContent: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0) {
      // Keep headings, paragraphs with substantial content
      if (trimmed.startsWith('#') || 
          (trimmed.length > 50 && !trimmed.startsWith('['))) {
        mainContent.push(trimmed);
      }
    }
  }
  
  return mainContent.join('\n\n').slice(0, 5000); // Limit content length
}
