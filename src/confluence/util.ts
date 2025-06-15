/**
 * Utility functions for Confluence URL parsing and manipulation
 */

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
 * Extract base URL from Confluence page URL
 */
export function extractBaseUrl(url: string): string {
  // Pattern: https://xxx.atlassian.net/wiki/spaces/ABC/pages/123456/page-title
  const match = url.match(/(https:\/\/[^\/]+\/wiki)/);
  if (!match || !match[1]) {
    throw new Error(`Invalid Confluence URL format: ${url}`);
  }
  return match[1];
}
