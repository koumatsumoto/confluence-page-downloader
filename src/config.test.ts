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
      process.env["CONFLUENCE_USER_EMAIL"] = "test@example.com";
      process.env["CONFLUENCE_API_TOKEN"] = "test-token";

      const config = loadConfig();

      expect(config).toEqual({
        userEmail: "test@example.com",
        apiToken: "test-token",
      });
    });

    test("should throw error when CONFLUENCE_USER_EMAIL is missing", () => {
      process.env["CONFLUENCE_API_TOKEN"] = "test-token";

      expect(() => loadConfig()).toThrow("CONFLUENCE_USER_EMAIL environment variable is required");
    });

    test("should throw error when CONFLUENCE_API_TOKEN is missing", () => {
      process.env["CONFLUENCE_USER_EMAIL"] = "test@example.com";

      expect(() => loadConfig()).toThrow("CONFLUENCE_API_TOKEN environment variable is required");
    });
  });

  describe("createAuthHeader", () => {
    test("should create correct Basic Auth header", () => {
      const userEmail = "test@example.com";
      const apiToken = "test-token";

      const authHeader = createAuthHeader(userEmail, apiToken);

      const expectedCredentials = Buffer.from("test@example.com:test-token").toString("base64");
      expect(authHeader).toBe(`Basic ${expectedCredentials}`);
    });

    test("should handle special characters in credentials", () => {
      const userEmail = "user+test@example.com";
      const apiToken = "token-with-special-chars!@#";

      const authHeader = createAuthHeader(userEmail, apiToken);

      const expectedCredentials = Buffer.from("user+test@example.com:token-with-special-chars!@#").toString("base64");
      expect(authHeader).toBe(`Basic ${expectedCredentials}`);
    });
  });
});
