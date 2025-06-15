import { describe, test, beforeEach, afterEach, expect, vi } from "vitest";
import { main, generateDefaultFilename, downloadPage } from "./main.mts";
import * as config from "./config.mts";
import * as confluenceClient from "./confluence-client.mts";
import * as fileWriter from "./file-writer.mts";

// Mock dependencies
vi.mock("./config.mts");
vi.mock("./confluence-client.mts");
vi.mock("./file-writer.mts");

const mockLoadConfig = vi.mocked(config.loadConfig);
const mockExtractPageId = vi.mocked(confluenceClient.extractPageId);
const mockFetchConfluencePage = vi.mocked(confluenceClient.fetchConfluencePage);
const mockSavePageToFile = vi.mocked(fileWriter.savePageToFile);

describe("main", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe("main function", () => {
    test("should output startup messages", () => {
      main();

      expect(consoleSpy).toHaveBeenCalledWith("Confluence Page Downloader started!");
      expect(consoleSpy).toHaveBeenCalledWith("This is a simple TypeScript implementation.");
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    test("should be a function", () => {
      expect(typeof main).toBe("function");
    });
  });

  describe("generateDefaultFilename", () => {
    test("should generate markdown filename by default", () => {
      const filename = generateDefaultFilename("123456");
      expect(filename).toBe("123456.md");
    });

    test("should generate HTML filename when specified", () => {
      const filename = generateDefaultFilename("123456", "html");
      expect(filename).toBe("123456.html");
    });

    test("should generate markdown filename when specified", () => {
      const filename = generateDefaultFilename("789012", "markdown");
      expect(filename).toBe("789012.md");
    });
  });

  describe("downloadPage", () => {
    const mockConfig = {
      baseUrl: "https://example.atlassian.net/wiki",
      username: "test@example.com",
      apiToken: "test-token",
    };

    const mockPageData = {
      id: "123456",
      title: "Test Page",
      body: {
        storage: {
          value: "<p>Test content</p>",
          representation: "storage",
        },
      },
      _links: {
        webui: "/spaces/ABC/pages/123456/Test+Page",
      },
    };

    beforeEach(() => {
      mockLoadConfig.mockReturnValue(mockConfig);
      mockExtractPageId.mockReturnValue("123456");
      mockFetchConfluencePage.mockResolvedValue(mockPageData);
      mockSavePageToFile.mockResolvedValue();
    });

    test("should download page with default settings", async () => {
      await downloadPage({
        url: "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/Test+Page",
      });

      expect(mockLoadConfig).toHaveBeenCalled();
      expect(mockExtractPageId).toHaveBeenCalledWith("https://example.atlassian.net/wiki/spaces/ABC/pages/123456/Test+Page");
      expect(mockFetchConfluencePage).toHaveBeenCalledWith(mockConfig, "123456");
      expect(mockSavePageToFile).toHaveBeenCalledWith(mockPageData, expect.stringContaining("123456.md"), undefined);

      expect(consoleSpy).toHaveBeenCalledWith("Fetching page 123456...");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Saving to .*123456\.md\.\.\./));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Successfully downloaded page "Test Page" to .*123456\.md/));
    });

    test("should download page with custom output path", async () => {
      await downloadPage({
        url: "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/Test+Page",
        outputPath: "./custom/path.html",
      });

      expect(mockSavePageToFile).toHaveBeenCalledWith(mockPageData, expect.stringContaining("custom/path.html"), undefined);
    });

    test("should download page with specific format", async () => {
      await downloadPage({
        url: "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/Test+Page",
        format: "html",
      });

      expect(mockSavePageToFile).toHaveBeenCalledWith(mockPageData, expect.stringContaining("123456.html"), "html");
    });

    test("should handle configuration errors", async () => {
      mockLoadConfig.mockImplementation(() => {
        throw new Error("Missing environment variables");
      });

      await expect(
        downloadPage({
          url: "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/Test+Page",
        }),
      ).rejects.toThrow("Failed to download page: Missing environment variables");
    });

    test("should handle page fetch errors", async () => {
      mockFetchConfluencePage.mockRejectedValue(new Error("Page not found"));

      await expect(
        downloadPage({
          url: "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/Test+Page",
        }),
      ).rejects.toThrow("Failed to download page: Page not found");
    });

    test("should handle file save errors", async () => {
      mockSavePageToFile.mockRejectedValue(new Error("Permission denied"));

      await expect(
        downloadPage({
          url: "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/Test+Page",
        }),
      ).rejects.toThrow("Failed to download page: Permission denied");
    });

    test("should handle unknown errors", async () => {
      mockLoadConfig.mockImplementation(() => {
        throw "Unknown error";
      });

      await expect(
        downloadPage({
          url: "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/Test+Page",
        }),
      ).rejects.toThrow("Unknown error occurred while downloading page");
    });
  });
});
