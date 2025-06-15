/**
 * Main function for the Confluence page downloader application
 */

import { loadConfig } from "./config.mts";
import { extractPageId, fetchConfluencePage } from "./confluence-client.mts";
import { savePageToFile, type OutputFormat } from "./file-writer.mts";
import { resolve } from "path";

export interface DownloadOptions {
  url: string;
  outputPath?: string;
  format?: OutputFormat;
}

/**
 * Generate default filename based on page ID and format
 */
export function generateDefaultFilename(pageId: string, format: OutputFormat = "markdown"): string {
  const extension = format === "html" ? "html" : "md";
  return `${pageId}.${extension}`;
}

/**
 * Download a Confluence page and save it to a file
 */
export async function downloadPage(options: DownloadOptions): Promise<void> {
  try {
    // Load configuration
    const config = loadConfig();

    // Extract page ID from URL
    const pageId = extractPageId(options.url);

    // Fetch page data
    console.log(`Fetching page ${pageId}...`);
    const pageData = await fetchConfluencePage(config, pageId);

    // Determine output path and format
    const outputPath = options.outputPath || generateDefaultFilename(pageId, options.format);
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
 * Main function for CLI usage
 */
export function main(): void {
  console.log("Confluence Page Downloader started!");
  console.log("This is a simple TypeScript implementation.");
}

// Execute main function if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
