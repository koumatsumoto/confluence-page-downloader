/**
 * Configuration management for Confluence API
 */

export interface ConfluenceConfig {
  baseUrl: string;
  username: string;
  apiToken: string;
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): ConfluenceConfig {
  const baseUrl = process.env["CONFLUENCE_BASE_URL"];
  const username = process.env["CONFLUENCE_USERNAME"];
  const apiToken = process.env["CONFLUENCE_API_TOKEN"];

  if (!baseUrl) {
    throw new Error("CONFLUENCE_BASE_URL environment variable is required");
  }

  if (!username) {
    throw new Error("CONFLUENCE_USERNAME environment variable is required");
  }

  if (!apiToken) {
    throw new Error("CONFLUENCE_API_TOKEN environment variable is required");
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""), // Remove trailing slashes
    username,
    apiToken,
  };
}

/**
 * Create Basic Authentication header value
 */
export function createAuthHeader(username: string, apiToken: string): string {
  const credentials = `${username}:${apiToken}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}
