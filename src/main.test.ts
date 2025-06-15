import { describe, test, beforeEach, afterEach, expect, vi } from "vitest";
import { main } from "./main.mts";

describe("main function", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("should output startup messages", () => {
    main();

    expect(consoleSpy).toHaveBeenCalledWith("Confluence Page Downloader started!");
    expect(consoleSpy).toHaveBeenCalledWith("This is a simple TypeScript implementation.");
    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });

  test("should be a function", () => {
    expect(typeof main).toBe("function");
  });
});
