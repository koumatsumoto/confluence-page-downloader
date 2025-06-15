/**
 * Markdown converter for Confluence page content
 */

import type { ConfluencePage } from "../confluence/types.mts";

/**
 * Convert Confluence export_view format to Markdown (basic conversion)
 */
export function convertToMarkdown(page: ConfluencePage): string {
  let content = page.body.export_view.value;

  // Basic HTML to Markdown conversion
  content = content
    // Remove XML namespaces and Confluence-specific attributes
    .replace(/\s+xmlns[^=]*="[^"]*"/g, "")
    .replace(/\s+ac:[^=]*="[^"]*"/g, "")
    .replace(/\s+ri:[^=]*="[^"]*"/g, "")
    // Convert code blocks (more specific pattern)
    .replace(
      /<ac:structured-macro[^>]*ac:name="code"[^>]*>[\s\S]*?<ac:plain-text-body[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/ac:plain-text-body>[\s\S]*?<\/ac:structured-macro>/g,
      "```\n$1\n```",
    )
    // Convert headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1")
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1")
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1")
    // Convert paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    // Convert strong/bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    // Convert emphasis/italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
    // Convert inline code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    // Convert line breaks
    .replace(/<br\s*\/?>/gi, "\n")
    // Remove remaining HTML tags (basic cleanup)
    .replace(/<[^>]+>/g, "")
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  return `# ${page.title}\n\n${content}`;
}
