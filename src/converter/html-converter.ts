/**
 * HTML converter for Confluence page content
 */

import type { ConfluencePage } from "../confluence/types";

/**
 * Convert Confluence export_view format to HTML
 */
export function convertToHtml(page: ConfluencePage): string {
  const content = page.body.export_view.value;

  // Simple HTML content without full document structure
  return `<h1>${escapeHtml(page.title)}</h1>
${content}`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}
