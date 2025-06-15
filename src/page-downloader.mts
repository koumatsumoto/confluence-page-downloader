/**
 * Page downloader implementation for the Confluence page downloader CLI
 */

import { loadConfig } from "./config.mts";
import { extractPageId, ConfluenceClient } from "./confluence/client.mts";
import { savePageToFile } from "./file-writer.mts";
import { resolve } from "path";

export interface DownloadOptions {
  url: string;
  format: "html" | "md";
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

/**
 * Download a Confluence page and save it to a file
 */
export async function downloadPage(options: DownloadOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig();

    // Extract base URL and page ID from URL
    const baseUrl = extractBaseUrl(options.url);
    const pageId = extractPageId(options.url);

    // Create Confluence client and fetch page data
    console.log(`Fetching page ${pageId}...`);
    const client = new ConfluenceClient(baseUrl, config.userEmail, config.apiToken);
    const pageData = await client.fetchPage(pageId);

    // Generate output path
    const outputPath = `${pageId}.${options.format}`;
    const resolvedPath = resolve(outputPath);

    // Save to file
    console.log(`Saving to ${resolvedPath}...`);
    await savePageToFile(pageData, resolvedPath, options.format);

    console.log(`Successfully downloaded page "${pageData.title}" to ${resolvedPath}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to download page: ${error.message}`);
    }
    throw new Error("Unknown error occurred while downloading page");
  }
}

/**
 * Handle CLI action for downloading Confluence pages
 */
export async function handleCliAction(url: string, options: { format: "html" | "md" }) {
  try {
    // Validate URL
    if (!url || !url.includes("atlassian.net")) {
      throw new Error("Please provide a valid Confluence URL");
    }

    // Download page
    const downloadOptions = {
      url,
      format: options.format,
    };

    await downloadPage(downloadOptions);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");

    // Provide helpful hints for common issues
    if (error instanceof Error && error.message.includes("Missing required environment variables")) {
      console.error("\nPlease set the following environment variables:");
      console.error('  export CONFLUENCE_USER_EMAIL="your-email@company.com"');
      console.error('  export CONFLUENCE_API_TOKEN="your-api-token"');
    }

    process.exit(1);
  }
}
