#!/usr/bin/env -S node --experimental-strip-types

import { Command } from "commander";
import { handleCliAction } from "./page-downloader.mts";

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
  .argument("[output]", "Output file path (optional)")
  .option("-f, --format <format>", "Output format: html or md", "md")
  .action(async (url: string, output?: string, options?: { format?: string }) => {
    await handleCliAction(url, output, options);
  });

// Parse command line arguments
program.parse();
