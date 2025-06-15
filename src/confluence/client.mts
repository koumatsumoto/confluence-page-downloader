/**
 * Confluence API client for fetching page content
 */

import type { ConfluencePage } from "./types.mts";

// Re-export types for convenience
export type { ConfluencePage } from "./types.mts";

/**
 * Extract page ID from Confluence URL
 */
export function extractPageId(url: string): string {
  // Pattern: https://xxx.atlassian.net/wiki/spaces/ABC/pages/123456/page-title
  const match = url.match(/\/pages\/(\d+)/);
  if (!match || !match[1]) {
    throw new Error(`Invalid Confluence URL format: ${url}`);
  }
  return match[1];
}

/**
 * Confluence API client class
 */
export class ConfluenceClient {
  private readonly baseUrl: string;
  private readonly email: string;
  private readonly apiToken: string;

  constructor(baseUrl: string, email: string, apiToken: string) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.apiToken = apiToken;
  }

  /**
   * Create Basic Authentication header value
   */
  private createAuthHeader(): string {
    const credentials = `${this.email}:${this.apiToken}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  /**
   * Fetch a Confluence page by ID
   */
  async fetchPage(pageId: string): Promise<ConfluencePage> {
    const url = `${this.baseUrl}/api/v2/pages/${pageId}?body-format=export_view`;
    const authHeader = this.createAuthHeader();

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
      }

      const pageData = (await response.json()) as ConfluencePage;
      return pageData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching Confluence page: ${error.message}`);
      }
      throw new Error("Unknown error occurred while fetching Confluence page");
    }
  }
}
