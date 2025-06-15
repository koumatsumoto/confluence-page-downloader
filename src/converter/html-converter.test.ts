import { describe, test, expect } from "vitest";
import { convertToHtml } from "./html-converter";
import type { ConfluencePage } from "../confluence/types";

describe("html-converter", () => {
  describe("convertToHtml", () => {
    const mockPage: ConfluencePage = {
      id: "123456",
      title: "Test Page",
      body: {
        export_view: {
          value: "<p>Test content with <strong>bold</strong> text</p>",
          representation: "export_view",
        },
      },
      _links: {
        webui: "/spaces/ABC/pages/123456/Test+Page",
      },
    };

    test("should convert page to HTML format", () => {
      const html = convertToHtml(mockPage);

      expect(html).toContain("<h1>Test Page</h1>");
      expect(html).toContain("<p>Test content with <strong>bold</strong> text</p>");
      expect(html).not.toContain("<!DOCTYPE html>");
      expect(html).not.toContain("<title>");
    });

    test("should escape HTML in title", () => {
      const pageWithSpecialChars: ConfluencePage = {
        ...mockPage,
        title: "Test & \"Page\" <with> 'special' chars",
      };

      const html = convertToHtml(pageWithSpecialChars);

      expect(html).toContain("<h1>Test &amp; &quot;Page&quot; &lt;with&gt; &#39;special&#39; chars</h1>");
      expect(html).not.toContain("<title>");
    });
  });
});
