import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { loadConfig, createAuthHeader } from "./config.mts";

describe("config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("loadConfig", () => {
    test("should load valid configuration from environment variables", () => {
      process.env["CONFLUENCE_BASE_URL"] = "https://example.atlassian.net/wiki";
      process.env["CONFLUENCE_USERNAME"] = "test@example.com";
      process.env["CONFLUENCE_API_TOKEN"] = "test-token";

      const config = loadConfig();

      expect(config).toEqual({
        baseUrl: "https://example.atlassian.net/wiki",
        username: "test@example.com",
        apiToken: "test-token",
      });
    });

    test("should remove trailing slashes from baseUrl", () => {
      process.env["CONFLUENCE_BASE_URL"] = "https://example.atlassian.net/wiki///";
      process.env["CONFLUENCE_USERNAME"] = "test@example.com";
      process.env["CONFLUENCE_API_TOKEN"] = "test-token";

      const config = loadConfig();

      expect(config.baseUrl).toBe("https://example.atlassian.net/wiki");
    });

    test("should throw error when CONFLUENCE_BASE_URL is missing", () => {
      process.env["CONFLUENCE_USERNAME"] = "test@example.com";
      process.env["CONFLUENCE_API_TOKEN"] = "test-token";

      expect(() => loadConfig()).toThrow("CONFLUENCE_BASE_URL environment variable is required");
    });

    test("should throw error when CONFLUENCE_USERNAME is missing", () => {
      process.env["CONFLUENCE_BASE_URL"] = "https://example.atlassian.net/wiki";
      process.env["CONFLUENCE_API_TOKEN"] = "test-token";

      expect(() => loadConfig()).toThrow("CONFLUENCE_USERNAME environment variable is required");
    });

    test("should throw error when CONFLUENCE_API_TOKEN is missing", () => {
      process.env["CONFLUENCE_BASE_URL"] = "https://example.atlassian.net/wiki";
      process.env["CONFLUENCE_USERNAME"] = "test@example.com";

      expect(() => loadConfig()).toThrow("CONFLUENCE_API_TOKEN environment variable is required");
    });
  });

  describe("createAuthHeader", () => {
    test("should create correct Basic Auth header", () => {
      const username = "test@example.com";
      const apiToken = "test-token";

      const authHeader = createAuthHeader(username, apiToken);

      const expectedCredentials = Buffer.from("test@example.com:test-token").toString("base64");
      expect(authHeader).toBe(`Basic ${expectedCredentials}`);
    });

    test("should handle special characters in credentials", () => {
      const username = "user+test@example.com";
      const apiToken = "token-with-special-chars!@#";

      const authHeader = createAuthHeader(username, apiToken);

      const expectedCredentials = Buffer.from("user+test@example.com:token-with-special-chars!@#").toString("base64");
      expect(authHeader).toBe(`Basic ${expectedCredentials}`);
    });
  });
});
