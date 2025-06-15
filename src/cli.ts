#!/usr/bin/env node

import { Command, Option } from "commander";
import { downloadPage } from "./download";

const program = new Command();

// Package info
const packageInfo = {
  name: "confluence-page-downloader",
  version: "1.0.0",
  description: "Download Confluence pages as HTML or Markdown files",
};

program
  .name("cpdown")
  .description(packageInfo.description)
  .version(packageInfo.version)
  .argument("<url>", "Confluence page URL")
  .addOption(new Option("-f, --format <format>", "Output format: html or md").choices(["html", "md"]).default("md"))
  .action(async (url: string, options: { format: "html" | "md" }) => {
    await downloadPage(url, options);
  });

// Parse command line arguments
program.parse();
