/**
 * Page downloader implementation for the Confluence page downloader CLI
 */

import { writeFile } from "node:fs/promises";
import { loadConfig } from "./config";
import { ConfluenceClient } from "./confluence/client";
import { extractPageId, extractBaseUrl } from "./confluence/util";
import { convertToHtml } from "./converter/html-converter";
import { convertToMarkdown } from "./converter/markdown-converter";

/**
 * Download a Confluence page and save it to a file
 */
export async function downloadPage(url: string, options: { format: "html" | "md" }) {
  try {
    // Validate URL
    if (!url || !url.includes("atlassian.net")) {
      throw new Error("Please provide a valid Confluence URL");
    }

    // Load configuration
    const config = loadConfig();

    // Extract base URL and page ID from URL
    const baseUrl = extractBaseUrl(url);
    const pageId = extractPageId(url);

    // Create Confluence client and fetch page data
    console.log(`Fetching page ${pageId}...`);
    const client = new ConfluenceClient(baseUrl, config.userEmail, config.apiToken);
    const pageData = await client.fetchPage(pageId);

    // Generate output path
    const outputPath = `${pageId}.${options.format}`;

    // Convert content based on format
    let content: string;
    switch (options.format) {
      case "html":
        content = convertToHtml(pageData);
        break;
      case "md":
        content = convertToMarkdown(pageData);
        break;
      default:
        throw new Error(`Unsupported output format: ${options.format}`);
    }

    // Save to file
    console.log(`Saving to ${outputPath}...`);
    await writeFile(outputPath, content, "utf-8");

    console.log(`Successfully downloaded page "${pageData.title}" to ${outputPath}`);
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
