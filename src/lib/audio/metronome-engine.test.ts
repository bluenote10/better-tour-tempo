import { describe, it, expect } from "vitest";
import { MetronomeEngine } from "./metronome-engine";
import { FILE_BASED_TYPES } from "./sequence";
import { existsSync } from "fs";
import { join } from "path";

describe("MetronomeEngine", () => {
  describe("getFileUrl", () => {
    it("should return existing file paths for all FileBasedClickType values", () => {
      for (const clickType of FILE_BASED_TYPES) {
        const url = MetronomeEngine.getFileUrl(clickType);
        // Remove leading slash to get relative path from static folder
        const filename = url.substring(1);
        const filepath = join(process.cwd(), "static", filename);

        expect(existsSync(filepath), `File should exist: ${filepath}`).toBe(true);
      }
    });
  });
});
