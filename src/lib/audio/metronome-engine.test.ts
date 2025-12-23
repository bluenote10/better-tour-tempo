import { describe, it, expect } from "vitest";
import { MetronomeEngine } from "./metronome-engine";
import { FILE_BASED_TYPES } from "./sequence";
import { existsSync } from "fs";
import { join } from "path";

describe("MetronomeEngine", () => {
  describe("getFileUrl", () => {
    it("should return existing file paths for all FileBasedClickType values", () => {
      for (const clickType of FILE_BASED_TYPES) {
        const filename = MetronomeEngine.getSampleFilename(clickType);
        const filepath = join(process.cwd(), "static", filename);

        expect(existsSync(filepath), `File should exist: ${filepath}`).toBe(true);
      }
    });
  });
});
