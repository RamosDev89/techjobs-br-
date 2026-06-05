import type { ScrapedVaga } from "@/types";

export interface ScraperResult {
  source: string;
  vagas: ScrapedVaga[];
  errors: string[];
}

export interface ScraperOptions {
  maxResults?: number;
  keywords?: string[];
}
