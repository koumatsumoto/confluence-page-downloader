import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { ConfluenceClient } from "./client";

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

  describe("ConfluenceClient", () => {
    const baseUrl = "https://example.atlassian.net/wiki";
    const email = "test@example.com";
    const apiToken = "test-token";

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

    let client: ConfluenceClient;

    beforeEach(() => {
      client = new ConfluenceClient(baseUrl, email, apiToken);
    });

    test("should fetch page successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockPageData,
      });

      const result = await client.fetchPage("123456");

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

      await expect(client.fetchPage("123456")).rejects.toThrow("Failed to fetch page: 404 Not Found");
    });

    test("should throw error when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(client.fetchPage("123456")).rejects.toThrow("Error fetching Confluence page: Network error");
    });

    test("should throw error for unknown errors", async () => {
      mockFetch.mockRejectedValueOnce("Unknown error");

      await expect(client.fetchPage("123456")).rejects.toThrow("Unknown error occurred while fetching Confluence page");
    });

    test("should use correct authorization header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => mockPageData,
      });

      await client.fetchPage("123456");

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
