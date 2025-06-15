/**
 * Configuration management for Confluence API
 */

export interface ConfluenceConfig {
  userEmail: string;
  apiToken: string;
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): ConfluenceConfig {
  const userEmail = process.env["CONFLUENCE_USER_EMAIL"];
  const apiToken = process.env["CONFLUENCE_API_TOKEN"];

  if (!userEmail) {
    throw new Error("CONFLUENCE_USER_EMAIL environment variable is required");
  }

  if (!apiToken) {
    throw new Error("CONFLUENCE_API_TOKEN environment variable is required");
  }

  return {
    userEmail,
    apiToken,
  };
}

/**
 * Create Basic Authentication header value
 */
export function createAuthHeader(userEmail: string, apiToken: string): string {
  const credentials = `${userEmail}:${apiToken}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}
