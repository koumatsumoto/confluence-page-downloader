import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { downloadPage } from "./download.mts";

// Mock modules
vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(),
}));

vi.mock("./config.mts", () => ({
  loadConfig: vi.fn(() => ({
    userEmail: "test@example.com",
    apiToken: "test-api-token",
  })),
}));

const { writeFile } = await import("node:fs/promises");

// MSW server setup
const mockPageData = {
  parentId: "163949",
  spaceId: "163842",
  ownerId: "70121:629b46bd-369a-4444-ae60-f8dd1a3a1dd4",
  sourceTemplateEntityId: "com.atlassian.confluence.plugins.confluence-business-blueprints:meeting-notes-blueprint",
  lastOwnerId: null,
  createdAt: "2025-06-15T02:06:26.773Z",
  parentType: "page",
  authorId: "70121:629b46bd-369a-4444-ae60-f8dd1a3a1dd4",
  position: 1099,
  version: {
    number: 1,
    message: "",
    minorEdit: false,
    authorId: "70121:629b46bd-369a-4444-ae60-f8dd1a3a1dd4",
    createdAt: "2025-06-15T02:49:54.109Z",
    ncsStepVersion: "7",
  },
  body: {
    export_view: {
      representation: "export_view",
      value: `<h2 id="id-2025-06-15Meetingnotes-Date"><img class="emoticon emoticon-blue-star" data-emoji-id="1f5d3" data-emoji-shortname=":calendar_spiral:" data-emoji-fallback="🗓" src="https://koumatsumotojp.atlassian.net/wiki/s/-1307431647/6452/29e93f3159d40a2ecf20c260a7d6e8593ee31669/_/images/icons/emoticons/72/1f5d3.png" width="16" height="16" data-emoticon-name="blue-star" alt="(blue star)" /> Date</h2><p><time datetime="2025-06-15" class="date-upcoming">15 Jun 2025</time></p><h2 id="id-2025-06-15Meetingnotes-Participants"><img class="emoticon emoticon-blue-star" data-emoji-id="1f465" data-emoji-shortname=":busts_in_silhouette:" data-emoji-fallback="👥" src="https://koumatsumotojp.atlassian.net/wiki/s/-1307431647/6452/29e93f3159d40a2ecf20c260a7d6e8593ee31669/_/images/icons/emoticons/72/1f465.png" width="16" height="16" data-emoticon-name="blue-star" alt="(blue star)" /> Participants</h2><p></p><ul><li><p><a class="confluence-userlink user-mention current-user-mention" data-account-id="70121:629b46bd-369a-4444-ae60-f8dd1a3a1dd4" href="https://koumatsumotojp.atlassian.net/wiki/people/70121:629b46bd-369a-4444-ae60-f8dd1a3a1dd4?ref=confluence" target="_blank" data-linked-resource-id="98305" data-linked-resource-version="1" data-linked-resource-type="userinfo" data-base-url="https://koumatsumotojp.atlassian.net/wiki">kouMatsumoto</a></p></li><li><p></p></li></ul><h2 id="id-2025-06-15Meetingnotes-Goals"><img class="emoticon emoticon-blue-star" data-emoji-id="1f945" data-emoji-shortname=":goal:" data-emoji-fallback="🥅" src="https://koumatsumotojp.atlassian.net/wiki/s/-1307431647/6452/29e93f3159d40a2ecf20c260a7d6e8593ee31669/_/images/icons/emoticons/72/1f945.png" width="16" height="16" data-emoticon-name="blue-star" alt="(blue star)" /> Goals</h2><p></p><ul><li><p /></li></ul><h2 id="id-2025-06-15Meetingnotes-Whiteboard"><img class="emoticon emoticon-blue-star" data-emoji-id="1f3a8" data-emoji-shortname=":art:" data-emoji-fallback="🎨" src="https://koumatsumotojp.atlassian.net/wiki/s/-1307431647/6452/29e93f3159d40a2ecf20c260a7d6e8593ee31669/_/images/icons/emoticons/72/1f3a8.png" width="16" height="16" data-emoticon-name="blue-star" alt="(blue star)" /> Whiteboard</h2><p></p><h2 id="id-2025-06-15Meetingnotes-Discussiontopics"><img class="emoticon emoticon-blue-star" data-emoji-id="1f5e3" data-emoji-shortname=":speaking_head:" data-emoji-fallback="🗣" src="https://koumatsumotojp.atlassian.net/wiki/s/-1307431647/6452/29e93f3159d40a2ecf20c260a7d6e8593ee31669/_/images/icons/emoticons/72/1f5e3.png" width="16" height="16" data-emoticon-name="blue-star" alt="(blue star)" /> Discussion topics</h2><div class="table-wrap"><table data-table-width="760" data-layout="default" data-local-id="054ed7d7-9af8-4831-83c3-efe9342ee2a8" class="confluenceTable"><colgroup><col style="width: 120.0px;"/><col style="width: 120.0px;"/><col style="width: 127.0px;"/><col style="width: 392.0px;"/></colgroup><tbody><tr><th data-highlight-colour="#deebff" class="confluenceTh"><p><strong>Time</strong></p></th><th data-highlight-colour="#deebff" class="confluenceTh"><p><strong>Item</strong></p></th><th data-highlight-colour="#deebff" class="confluenceTh"><p><strong>Presenter</strong></p></th><th data-highlight-colour="#deebff" class="confluenceTh"><p><strong>Notes</strong></p></th></tr><tr><td class="confluenceTd"><p /></td><td class="confluenceTd"><p /></td><td class="confluenceTd"><p /></td><td class="confluenceTd"><ul><li><p></p></li></ul></td></tr><tr><td class="confluenceTd"><p><br/></p></td><td class="confluenceTd"><p><br/></p></td><td class="confluenceTd"><p><br/></p></td><td class="confluenceTd"><p><br/></p></td></tr></tbody></table></div><h2 id="id-2025-06-15Meetingnotes-Actionitems"><img class="emoticon emoticon-blue-star" data-emoji-id="2705" data-emoji-shortname=":white_check_mark:" data-emoji-fallback="✅" src="https://koumatsumotojp.atlassian.net/wiki/s/-1307431647/6452/29e93f3159d40a2ecf20c260a7d6e8593ee31669/_/images/icons/emoticons/72/2705.png" width="16" height="16" data-emoticon-name="blue-star" alt="(blue star)" /> Action items</h2><p></p><ul class="inline-task-list" data-inline-tasks-content-id="98307"><li data-inline-task-id="3"><span>&nbsp;</span></li></ul><h2 id="id-2025-06-15Meetingnotes-Decisions"><img class="emoticon emoticon-blue-star" data-emoji-id="2934" data-emoji-shortname=":arrow_heading_up:" data-emoji-fallback="⤴" src="https://koumatsumotojp.atlassian.net/wiki/s/-1307431647/6452/29e93f3159d40a2ecf20c260a7d6e8593ee31669/_/images/icons/emoticons/72/2934.png" width="16" height="16" data-emoticon-name="blue-star" alt="(blue star)" /> Decisions</h2><p></p><ul class="decision-list" /><h2 id="id-2025-06-15Meetingnotes-Relatedmaterials"><img class="emoticon emoticon-blue-star" data-emoji-id="1f5c3" data-emoji-shortname=":card_box:" data-emoji-fallback="🗃️" src="https://koumatsumotojp.atlassian.net/wiki/s/-1307431647/6452/29e93f3159d40a2ecf20c260a7d6e8593ee31669/_/images/icons/emoticons/72/1f5c3.png" width="16" height="16" data-emoticon-name="blue-star" alt="(blue star)" /> Related materials</h2><p></p>`,
    },
  },
  status: "current",
  title: "2025-06-15 Meeting notes",
  id: "98307",
  _links: {
    editui: "/pages/resumedraft.action?draftId=98307",
    webui: "/spaces/~70121629b46bd369a4444ae60f8dd1a3a1dd4/pages/98307/2025-06-15+Meeting+notes",
    edituiv2: "/spaces/~70121629b46bd369a4444ae60f8dd1a3a1dd4/pages/edit-v2/98307",
    tinyui: "/x/A4AB",
    base: "https://koumatsumotojp.atlassian.net/wiki",
  },
};

const server = setupServer(
  http.get("https://test.atlassian.net/wiki/api/v2/pages/98307", () => {
    return HttpResponse.json(mockPageData);
  }),
);

describe("download", () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: "error" });
    vi.clearAllMocks();
    // Mock console methods to avoid test output noise
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    server.resetHandlers();
    server.close();
    vi.restoreAllMocks();
  });

  describe("downloadPage", () => {
    const testUrl = "https://test.atlassian.net/wiki/spaces/~70121629b46bd369a4444ae60f8dd1a3a1dd4/pages/98307/2025-06-15+Meeting+notes";

    test("should download page as HTML format successfully", async () => {
      await downloadPage(testUrl, { format: "html" });

      // Verify writeFile was called with correct arguments
      expect(writeFile).toHaveBeenCalledWith("98307.html", expect.stringContaining("<h1>2025-06-15 Meeting notes</h1>"), "utf-8");

      // Verify the HTML content contains the page title and content
      const [, htmlContent] = (writeFile as any).mock.calls[0];
      expect(htmlContent).toContain("2025-06-15 Meeting notes");
      expect(htmlContent).toContain("Date");
      expect(htmlContent).toContain("Participants");
    });

    test("should download page as Markdown format successfully", async () => {
      await downloadPage(testUrl, { format: "md" });

      // Verify writeFile was called with correct arguments
      expect(writeFile).toHaveBeenCalledWith("98307.md", expect.stringContaining("# 2025-06-15 Meeting notes"), "utf-8");

      // Verify the Markdown content contains the page content
      const [, markdownContent] = (writeFile as any).mock.calls[0];
      expect(markdownContent).toContain("Date");
      expect(markdownContent).toContain("Participants");
    });

    test("should throw error for invalid URL", async () => {
      const invalidUrl = "https://invalid-url.com";

      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      await expect(downloadPage(invalidUrl, { format: "html" })).rejects.toThrow("process.exit");

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith("Error:", "Please provide a valid Confluence URL");
    });

    test("should throw error for empty URL", async () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      await expect(downloadPage("", { format: "html" })).rejects.toThrow("process.exit");

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith("Error:", "Please provide a valid Confluence URL");
    });

    test("should handle API error response", async () => {
      server.use(
        http.get("https://test.atlassian.net/wiki/api/v2/pages/98307", () => {
          return new HttpResponse(null, { status: 404, statusText: "Not Found" });
        }),
      );

      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      await expect(downloadPage(testUrl, { format: "html" })).rejects.toThrow("process.exit");

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith("Error:", "Error fetching Confluence page: Failed to fetch page: 404 Not Found");
    });

    test("should handle network error", async () => {
      server.use(
        http.get("https://test.atlassian.net/wiki/api/v2/pages/98307", () => {
          return HttpResponse.error();
        }),
      );

      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      await expect(downloadPage(testUrl, { format: "html" })).rejects.toThrow("process.exit");

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    test("should handle unsupported format", async () => {
      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      await expect(downloadPage(testUrl, { format: "xml" as any })).rejects.toThrow("process.exit");

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith("Error:", "Unsupported output format: xml");
    });

    test("should provide helpful hints for configuration errors", async () => {
      // Mock loadConfig to throw a configuration error
      const { loadConfig } = await import("./config.mts");
      vi.mocked(loadConfig).mockImplementationOnce(() => {
        throw new Error("Missing required environment variables");
      });

      const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit");
      });

      await expect(downloadPage(testUrl, { format: "html" })).rejects.toThrow("process.exit");

      expect(mockExit).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalledWith("Error:", "Missing required environment variables");
      expect(console.error).toHaveBeenCalledWith("\nPlease set the following environment variables:");
      expect(console.error).toHaveBeenCalledWith('  export CONFLUENCE_USER_EMAIL="your-email@company.com"');
      expect(console.error).toHaveBeenCalledWith('  export CONFLUENCE_API_TOKEN="your-api-token"');
    });

    test("writeFile should be called with correct file path and content", async () => {
      await downloadPage(testUrl, { format: "html" });

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenCalledWith(
        "98307.html", // Expected filename based on page ID
        expect.any(String), // HTML content
        "utf-8", // Encoding
      );
    });
  });
});
