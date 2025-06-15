import { describe, test, expect } from "vitest";
import { convertToMarkdown } from "./markdown-converter.mts";
import type { ConfluencePage } from "../confluence/types.mts";

describe("markdown-converter", () => {
  describe("convertToMarkdown", () => {
    test("should handle empty content", () => {
      const emptyPage: ConfluencePage = {
        id: "123456",
        title: "Test Page",
        body: {
          export_view: {
            value: "",
            representation: "export_view",
          },
        },
        _links: {
          webui: "/spaces/ABC/pages/123456/Test+Page",
        },
      };

      const markdown = convertToMarkdown(emptyPage);
      expect(markdown).toBe("# Test Page\n\n");
    });

    test("should convert basic HTML elements to Markdown", () => {
      const page: ConfluencePage = {
        id: "123456",
        title: "Test Page",
        body: {
          export_view: {
            value: "<h2>Section</h2><p>Text with <strong>bold</strong> and <em>italic</em> formatting.</p>",
            representation: "export_view",
          },
        },
        _links: {
          webui: "/spaces/ABC/pages/123456/Test+Page",
        },
      };

      const markdown = convertToMarkdown(page);

      expect(markdown).toContain("# Test Page");
      expect(markdown).toContain("## Section");
      expect(markdown).toContain("**bold**");
      expect(markdown).toContain("_italic_");
    });

    test("should remove Confluence code blocks (current behavior)", () => {
      const page: ConfluencePage = {
        id: "123456",
        title: "Test Page",
        body: {
          export_view: {
            value:
              'Some text before <ac:structured-macro ac:name="code"><ac:plain-text-body><![CDATA[console.log("hello");]]></ac:plain-text-body></ac:structured-macro> some text after',
            representation: "export_view",
          },
        },
        _links: {
          webui: "/spaces/ABC/pages/123456/Test+Page",
        },
      };

      const markdown = convertToMarkdown(page);

      expect(markdown).toContain("# Test Page");
      expect(markdown).toContain("Some text before");
      expect(markdown).toContain("some text after");
      // Note: Current implementation doesn't properly convert code blocks
      expect(markdown).not.toContain("console.log");
    });
  });
});
