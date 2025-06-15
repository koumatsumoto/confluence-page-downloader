/**
 * Confluence API client for fetching page content
 */

import { createAuthHeader, type ConfluenceConfig } from "./config.mts";

export interface ConfluencePage {
  id: string;
  title: string;
  body: {
    export_view: {
      value: string;
      representation: string;
    };
  };
  _links: {
    webui: string;
  };
}

export interface ConfluencePageResponse {
  results: ConfluencePage[];
}

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
 * Fetch a Confluence page by ID
 */
export async function fetchConfluencePage(config: ConfluenceConfig, pageId: string): Promise<ConfluencePage> {
  const url = `${config.baseUrl}/api/v2/pages/${pageId}?body-format=export_view`;
  const authHeader = createAuthHeader(config.username, config.apiToken);

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
