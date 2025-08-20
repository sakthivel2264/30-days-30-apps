/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ScrapeData {
  url: string;
  title?: string;
  markdown?: string;
  html?: string;
  screenshot?: string;
  links?: Link[];
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string | string[]; // Fix: Allow both string and string array
    author?: string;
    ogImage?: string;
    favicon?: string;
    [key: string]: any; // Allow additional metadata properties
  };
  timestamp: string;
}

export interface Link {
  text: string;
  href: string;
}

// Fix: Use proper Firecrawl format types
export type FormatOption = 'markdown' | 'html' | 'rawHtml' | 'screenshot' | 'links';

export interface ScrapeOptions {
  formats: FormatOption[];
  includeTags?: string[];
  excludeTags?: string[];
  onlyMainContent?: boolean;
  waitFor?: number;
}


export interface CrawlResult {
  success: boolean;
  data?: ScrapeData[];
  error?: string;
  totalPages?: number;
}

export interface ScrapeHistory {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  success: boolean;
}