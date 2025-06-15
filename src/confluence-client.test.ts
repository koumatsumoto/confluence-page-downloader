import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { extractPageId, fetchConfluencePage } from "./confluence-client.mts";
import type { ConfluenceConfig } from "./config.mts";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("confluence-client", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("extractPageId", () => {
    test("should extract page ID from valid Confluence URL", () => {
      const url = "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/page-title";
      const pageId = extractPageId(url);
      expect(pageId).toBe("123456");
    });

    test("should extract page ID from URL without page title", () => {
      const url = "https://example.atlassian.net/wiki/spaces/ABC/pages/789012";
      const pageId = extractPageId(url);
      expect(pageId).toBe("789012");
    });

    test("should extract page ID from URL with query parameters", () => {
      const url = "https://example.atlassian.net/wiki/spaces/ABC/pages/456789/page-title?view=edit";
      const pageId = extractPageId(url);
      expect(pageId).toBe("456789");
    });

    test("should throw error for invalid URL format", () => {
      const invalidUrls = [
        "https://example.com/invalid",
        "https://example.atlassian.net/wiki/spaces/ABC",
        "https://example.atlassian.net/wiki/spaces/ABC/pages/",
        "https://example.atlassian.net/wiki/spaces/ABC/pages/abc123",
      ];

      invalidUrls.forEach((url) => {
        expect(() => extractPageId(url)).toThrow(`Invalid Confluence URL format: ${url}`);
      });
    });
  });

  describe("fetchConfluencePage", () => {
    const mockConfig: ConfluenceConfig = {
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

    test("should fetch page successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockPageData,
      });

      const result = await fetchConfluencePage(mockConfig, "123456");

      expect(mockFetch).toHaveBeenCalledWith("https://example.atlassian.net/wiki/api/v2/pages/123456?body-format=export_view", {
        method: "GET",
        headers: {
          Authorization: expect.stringMatching(/^Basic /),
          Accept: "application/json",
        },
      });

      expect(result).toEqual(mockPageData);
    });

    test("should throw error when API returns non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(fetchConfluencePage(mockConfig, "123456")).rejects.toThrow("Failed to fetch page: 404 Not Found");
    });

    test("should throw error when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchConfluencePage(mockConfig, "123456")).rejects.toThrow("Error fetching Confluence page: Network error");
    });

    test("should throw error for unknown errors", async () => {
      mockFetch.mockRejectedValueOnce("Unknown error");

      await expect(fetchConfluencePage(mockConfig, "123456")).rejects.toThrow("Unknown error occurred while fetching Confluence page");
    });

    test("should use correct authorization header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockPageData,
      });

      await fetchConfluencePage(mockConfig, "123456");

      const expectedAuth = `Basic ${Buffer.from("test@example.com:test-token").toString("base64")}`;
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expectedAuth,
          }),
        }),
      );
    });
  });
});
