/**
 * Markdown converter for Confluence page content using Turndown
 */

import TurndownService from "turndown";
const { gfm } = require("turndown-plugin-gfm");
import type { ConfluencePage } from "../confluence/types";

// Create and configure Turndown service
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

// Use the gfm plugin
turndownService.use(gfm);

/**
 * Convert Confluence export_view format to Markdown using Turndown
 */
export function convertToMarkdown(page: ConfluencePage): string {
  let content = page.body.export_view.value;

  // Convert HTML to Markdown using Turndown
  const markdownContent = turndownService.turndown(content);

  return `# ${page.title}\n\n${markdownContent}`;
}
