import { describe, test, beforeEach, afterEach, expect, vi } from "vitest";
import { generateDefaultFilename } from "./page-downloader.mts";
import * as config from "./config.mts";
import * as confluenceClient from "./confluence-client.mts";
import * as fileWriter from "./file-writer.mts";

// Mock dependencies
vi.mock("./config.mts");
vi.mock("./confluence-client.mts");
vi.mock("./file-writer.mts");

// Mock downloadPage specifically for handleCliAction tests
const mockDownloadPage = vi.fn();
vi.mock("./page-downloader.mts", async () => {
  const actual = await vi.importActual("./page-downloader.mts");
  return {
    ...actual,
    downloadPage: mockDownloadPage,
  };
});

// Re-import after mocking
const { downloadPage, handleCliAction } = await import("./page-downloader.mts");

const mockLoadConfig = vi.mocked(config.loadConfig);
const mockExtractPageId = vi.mocked(confluenceClient.extractPageId);
const mockFetchConfluencePage = vi.mocked(confluenceClient.fetchConfluencePage);
const mockSavePageToFile = vi.mocked(fileWriter.savePageToFile);

// Mock console.error and process.exit for handleCliAction tests
const mockConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
const mockProcessExit = vi.spyOn(process, "exit").mockImplementation(() => {
  throw new Error("process.exit");
});

describe("page-downloader", () => {
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
    test("should be removed - no longer needed", () => {
      // The main function has been removed as it's no longer needed
      expect(true).toBe(true);
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

  describe("handleCliAction", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      mockDownloadPage.mockResolvedValue(undefined);
    });

    describe("URL validation", () => {
      test("should throw error for empty URL", async () => {
        await expect(() => handleCliAction("")).rejects.toThrow("process.exit");
        expect(mockConsoleError).toHaveBeenCalledWith("Error:", "Please provide a valid Confluence URL");
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      });

      test("should throw error for invalid URL", async () => {
        await expect(() => handleCliAction("https://example.com")).rejects.toThrow("process.exit");
        expect(mockConsoleError).toHaveBeenCalledWith("Error:", "Please provide a valid Confluence URL");
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      });

      test("should accept valid Confluence URL", async () => {
        const url = "https://company.atlassian.net/wiki/spaces/TEST/pages/123456/Test+Page";

        await handleCliAction(url);

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url,
          format: "markdown",
        });
      });
    });

    describe("format determination", () => {
      const validUrl = "https://company.atlassian.net/wiki/spaces/TEST/pages/123456/Test+Page";

      test("should use markdown as default format", async () => {
        await handleCliAction(validUrl);

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "markdown",
        });
      });

      test("should use format from options when provided", async () => {
        await handleCliAction(validUrl, undefined, { format: "html" });

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "html",
        });
      });

      test("should normalize 'md' format to 'markdown'", async () => {
        await handleCliAction(validUrl, undefined, { format: "md" });

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "markdown",
        });
      });

      test("should throw error for invalid format", async () => {
        await expect(() => handleCliAction(validUrl, undefined, { format: "invalid" })).rejects.toThrow("process.exit");
        expect(mockConsoleError).toHaveBeenCalledWith("Error:", "Format must be 'html' or 'md'");
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      });

      test("should auto-detect html format from output file extension", async () => {
        await handleCliAction(validUrl, "output.html");

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "html",
          outputPath: "output.html",
        });
      });

      test("should auto-detect markdown format from .md file extension", async () => {
        await handleCliAction(validUrl, "output.md");

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "markdown",
          outputPath: "output.md",
        });
      });

      test("should auto-detect markdown format from .markdown file extension", async () => {
        await handleCliAction(validUrl, "output.markdown");

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "markdown",
          outputPath: "output.markdown",
        });
      });

      test("should use default format for unknown file extension", async () => {
        await handleCliAction(validUrl, "output.txt");

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "markdown",
          outputPath: "output.txt",
        });
      });

      test("should prioritize options.format over file extension", async () => {
        await handleCliAction(validUrl, "output.html", { format: "md" });

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "markdown",
          outputPath: "output.html",
        });
      });
    });

    describe("downloadPage function calls", () => {
      const validUrl = "https://company.atlassian.net/wiki/spaces/TEST/pages/123456/Test+Page";

      test("should call downloadPage with correct arguments for basic case", async () => {
        await handleCliAction(validUrl);

        expect(mockDownloadPage).toHaveBeenCalledTimes(1);
        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "markdown",
        });
      });

      test("should call downloadPage with output path when provided", async () => {
        const outputPath = "/path/to/output.md";

        await handleCliAction(validUrl, outputPath);

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "markdown",
          outputPath,
        });
      });

      test("should call downloadPage with html format and output path", async () => {
        const outputPath = "/path/to/output.html";

        await handleCliAction(validUrl, outputPath, { format: "html" });

        expect(mockDownloadPage).toHaveBeenCalledWith({
          url: validUrl,
          format: "html",
          outputPath,
        });
      });
    });

    describe("error handling", () => {
      const validUrl = "https://company.atlassian.net/wiki/spaces/TEST/pages/123456/Test+Page";

      test("should handle downloadPage errors", async () => {
        mockDownloadPage.mockRejectedValueOnce(new Error("Download failed"));

        await expect(() => handleCliAction(validUrl)).rejects.toThrow("process.exit");
        expect(mockConsoleError).toHaveBeenCalledWith("Error:", "Download failed");
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      });

      test("should provide environment variable hints for missing config error", async () => {
        mockDownloadPage.mockRejectedValueOnce(new Error("Missing required environment variables"));

        await expect(() => handleCliAction(validUrl)).rejects.toThrow("process.exit");

        expect(mockConsoleError).toHaveBeenCalledWith("Error:", "Missing required environment variables");
        expect(mockConsoleError).toHaveBeenCalledWith("\nPlease set the following environment variables:");
        expect(mockConsoleError).toHaveBeenCalledWith('  export CONFLUENCE_BASE_URL="https://xxx.atlassian.net/wiki"');
        expect(mockConsoleError).toHaveBeenCalledWith('  export CONFLUENCE_USERNAME="your-username"');
        expect(mockConsoleError).toHaveBeenCalledWith('  export CONFLUENCE_API_TOKEN="your-api-token"');
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      });

      test("should handle unknown errors", async () => {
        mockDownloadPage.mockRejectedValueOnce("string error");

        await expect(() => handleCliAction(validUrl)).rejects.toThrow("process.exit");
        expect(mockConsoleError).toHaveBeenCalledWith("Error:", "Unknown error");
        expect(mockProcessExit).toHaveBeenCalledWith(1);
      });
    });
  });
});
