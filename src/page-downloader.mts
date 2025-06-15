/**
 * Page downloader implementation for the Confluence page downloader CLI
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
 * Handle CLI action for downloading Confluence pages
 */
export async function handleCliAction(url: string, output?: string, options?: { format?: string }) {
  try {
    // Validate URL
    if (!url || !url.includes("atlassian.net")) {
      throw new Error("Please provide a valid Confluence URL");
    }

    // Determine format
    let format: "html" | "markdown" = "markdown";
    if (options?.format) {
      // Normalize format values: accept html, md, markdown
      const normalizedFormat = options.format === "md" ? "markdown" : options.format;
      if (normalizedFormat !== "html" && normalizedFormat !== "markdown") {
        throw new Error("Format must be 'html' or 'md'");
      }
      format = normalizedFormat;
    } else if (output) {
      // Auto-detect format from file extension
      const ext = output.split(".").pop()?.toLowerCase();
      if (ext === "html") {
        format = "html";
      } else if (ext === "md" || ext === "markdown") {
        format = "markdown";
      }
    }

    // Download page
    const downloadOptions = {
      url,
      format,
      ...(output && { outputPath: output }),
    };

    await downloadPage(downloadOptions);
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : "Unknown error");

    // Provide helpful hints for common issues
    if (error instanceof Error && error.message.includes("Missing required environment variables")) {
      console.error("\nPlease set the following environment variables:");
      console.error('  export CONFLUENCE_BASE_URL="https://xxx.atlassian.net/wiki"');
      console.error('  export CONFLUENCE_USERNAME="your-username"');
      console.error('  export CONFLUENCE_API_TOKEN="your-api-token"');
    }

    process.exit(1);
  }
}
