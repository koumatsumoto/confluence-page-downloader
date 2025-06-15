import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { convertToHtml, convertToMarkdown, savePageToFile } from "./file-writer.mts";
import type { ConfluencePage } from "./confluence/types.mts";

// Mock fs
vi.mock("fs/promises", () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

import { writeFile, mkdir } from "fs/promises";

const mockWriteFile = vi.mocked(writeFile);
const mockMkdir = vi.mocked(mkdir);

describe("file-writer", () => {
  beforeEach(() => {
    mockWriteFile.mockClear();
    mockMkdir.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
  });

  describe("savePageToFile", () => {
    const mockPage: ConfluencePage = {
      id: "123456",
      title: "Test Page",
      body: {
        export_view: {
          value: "<p>Test content</p>",
          representation: "export_view",
        },
      },
      _links: {
        webui: "/spaces/ABC/pages/123456/Test+Page",
      },
    };

    beforeEach(() => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();
    });

    test("should save page as markdown when specified", async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      await savePageToFile(mockPage, "test.md", "md");

      expect(mockMkdir).toHaveBeenCalled();
      expect(mockWriteFile).toHaveBeenCalledWith("test.md", expect.stringContaining("# Test Page"), "utf-8");
    });

    test("should save page as HTML when specified", async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      await savePageToFile(mockPage, "test.html", "html");

      expect(mockWriteFile).toHaveBeenCalledWith("test.html", expect.stringContaining("<h1>Test Page</h1>"), "utf-8");
    });

    test("should use explicit format parameter", async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      await savePageToFile(mockPage, "test.txt", "html");

      expect(mockWriteFile).toHaveBeenCalledWith("test.txt", expect.stringContaining("<h1>Test Page</h1>"), "utf-8");
    });

    test("should create directory if it doesn't exist", async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockResolvedValue();

      await savePageToFile(mockPage, "test.md", "md");

      expect(mockMkdir).toHaveBeenCalled();
    });

    test("should handle write errors", async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockRejectedValueOnce(new Error("Permission denied"));

      await expect(savePageToFile(mockPage, "test.md", "md")).rejects.toThrow("Failed to save file: Permission denied");
    });

    test("should handle unknown errors", async () => {
      mockMkdir.mockResolvedValue(undefined);
      mockWriteFile.mockRejectedValueOnce("Unknown error");

      await expect(savePageToFile(mockPage, "test.md", "md")).rejects.toThrow("Unknown error occurred while saving file");
    });

    test("should throw error for unsupported format", async () => {
      await expect(savePageToFile(mockPage, "test.md", "pdf" as any)).rejects.toThrow("Unsupported output format: pdf");
    });
  });
});
