import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "./config";

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
});
