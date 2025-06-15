/**
 * Type definitions for Confluence API
 */

export interface ConfluencePage {
  id: string;
  title: string;
  body: {
    export_view: {
      value: string;
      representation: string;
    };
  };
  _links: {
    webui: string;
  };
}

export interface ConfluencePageResponse {
  results: ConfluencePage[];
}
