#!/usr/bin/env -S node --experimental-strip-types
/**
 * CLI entry point for confluence-page-downloader
 */

import { Command } from "commander";
import { downloadPage } from "./main.mts";

const program = new Command();

// Package info
const packageInfo = {
  name: "confluence-page-downloader",
  version: "1.0.0",
  description: "Download Confluence pages as HTML or Markdown files",
};

program
  .name("cpdown")
  .description(packageInfo.description)
  .version(packageInfo.version)
  .argument("<url>", "Confluence page URL")
  .argument("[output]", "Output file path (optional)")
  .option("--format <format>", "Output format: html or markdown", "markdown")
  .action(async (url: string, output?: string, options?: { format?: string }) => {
    try {
      // Validate URL
      if (!url || !url.includes("atlassian.net")) {
        throw new Error("Please provide a valid Confluence URL");
      }

      // Determine format
      let format: "html" | "markdown" = "markdown";
      if (options?.format) {
        if (options.format !== "html" && options.format !== "markdown") {
          throw new Error("Format must be either 'html' or 'markdown'");
        }
        format = options.format;
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
  });

// Parse command line arguments
program.parse();
