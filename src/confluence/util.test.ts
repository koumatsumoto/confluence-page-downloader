/**
 * Tests for Confluence utility functions
 */

import { describe, it, expect } from "vitest";
import { extractPageId, extractBaseUrl } from "./util";

describe("extractBaseUrl", () => {
  it("should extract base URL from valid Confluence URL", () => {
    const url = "https://example.atlassian.net/wiki/spaces/TEST/pages/123456/test-page";
    const result = extractBaseUrl(url);
    expect(result).toBe("https://example.atlassian.net/wiki");
  });

  it("should extract base URL from URL with subdomain", () => {
    const url = "https://company-dev.atlassian.net/wiki/spaces/DEV/pages/789012/test";
    const result = extractBaseUrl(url);
    expect(result).toBe("https://company-dev.atlassian.net/wiki");
  });

  it("should extract base URL from URL with complex structure", () => {
    const url = "https://my-org.atlassian.net/wiki/spaces/SPACE/pages/456789/Long+Page+Title+With+Special%20Characters";
    const result = extractBaseUrl(url);
    expect(result).toBe("https://my-org.atlassian.net/wiki");
  });

  it("should throw error for invalid URL format", () => {
    const invalidUrl = "https://example.com/not-confluence";
    expect(() => extractBaseUrl(invalidUrl)).toThrow("Invalid Confluence URL format");
  });

  it("should throw error for URL without wiki path", () => {
    const invalidUrl = "https://example.atlassian.net/different-path";
    expect(() => extractBaseUrl(invalidUrl)).toThrow("Invalid Confluence URL format");
  });

  it("should throw error for malformed URL", () => {
    const invalidUrl = "not-a-url";
    expect(() => extractBaseUrl(invalidUrl)).toThrow("Invalid Confluence URL format");
  });
});

describe("extractPageId", () => {
  it("should extract page ID from valid Confluence URL", () => {
    const url = "https://example.atlassian.net/wiki/spaces/ABC/pages/123456/page-title";
    const pageId = extractPageId(url);
    expect(pageId).toBe("123456");
  });

  it("should extract page ID from URL without page title", () => {
    const url = "https://example.atlassian.net/wiki/spaces/ABC/pages/789012";
    const pageId = extractPageId(url);
    expect(pageId).toBe("789012");
  });

  it("should extract page ID from URL with query parameters", () => {
    const url = "https://example.atlassian.net/wiki/spaces/ABC/pages/456789/page-title?view=edit";
    const pageId = extractPageId(url);
    expect(pageId).toBe("456789");
  });

  it("should throw error for invalid URL format", () => {
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
