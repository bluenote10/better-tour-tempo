import { describe, it, expect } from "vitest";
import { ClickIterator } from "./click-iterator";
import type { Sequence } from "./sequence";

describe("ClickIterator", () => {
  describe("basic iteration", () => {
    it("should return clicks in order", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
          { soundType: "synth1", beat: 2, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);

      const clicks1 = iterator.getClicksUpto(1);
      expect(clicks1).toHaveLength(1);
      expect(clicks1[0].beat).toBe(0);

      const clicks2 = iterator.getClicksUpto(2);
      expect(clicks2).toHaveLength(1);
      expect(clicks2[0].beat).toBe(1);

      const clicks3 = iterator.getClicksUpto(3);
      expect(clicks3).toHaveLength(1);
      expect(clicks3[0].beat).toBe(2);
    });

    it("should handle unsorted input by sorting", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 2, volume: 1.0 },
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);

      const clicks = iterator.getClicksUpto(3);
      expect(clicks).toHaveLength(3);
      expect(clicks[0].beat).toBe(0);
      expect(clicks[1].beat).toBe(1);
      expect(clicks[2].beat).toBe(2);
    });

    it("should return empty array when no clicks in range", () => {
      const sequence: Sequence = {
        clicks: [{ soundType: "synth1", beat: 2, volume: 1.0 }],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);
      const clicks = iterator.getClicksUpto(1);
      expect(clicks).toHaveLength(0);
    });

    it("should handle multiple clicks in single query", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
          { soundType: "synth1", beat: 2, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);
      const clicks = iterator.getClicksUpto(3);
      expect(clicks).toHaveLength(3);
    });
  });

  describe("wrap-around (looping)", () => {
    it("should wrap around when crossing maxBeat", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
          { soundType: "synth1", beat: 2, volume: 1.0 },
          { soundType: "synth1", beat: 3, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);

      // Get first loop
      const clicks1 = iterator.getClicksUpto(4);
      expect(clicks1).toHaveLength(4);
      expect(clicks1[0].beat).toBe(0);
      expect(clicks1[3].beat).toBe(3);

      // Get second loop - should wrap around with absolute beats
      const clicks2 = iterator.getClicksUpto(8);
      expect(clicks2).toHaveLength(4);
      expect(clicks2[0].beat).toBe(4);
      expect(clicks2[3].beat).toBe(7);
    });

    it("should handle partial wrap-around", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
          { soundType: "synth1", beat: 2, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);

      // Advance to beat 3 (no clicks there)
      iterator.getClicksUpto(3);

      // Query to beat 6 - range [3, 6) contains beats 4 and 5 (loop 1, positions 0 and 1)
      const clicks = iterator.getClicksUpto(6);
      expect(clicks).toHaveLength(2);
      expect(clicks[0].beat).toBe(4); // Loop 1, position 0
      expect(clicks[1].beat).toBe(5); // Loop 1, position 1
    });

    it("should handle multiple complete loops", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
        ],
        maxBeat: 2,
      };

      const iterator = new ClickIterator(sequence);

      // Jump 3 complete loops (6 beats)
      const clicks = iterator.getClicksUpto(6);
      expect(clicks).toHaveLength(6); // 2 clicks × 3 loops
    });

    it("should handle multiple complete loops plus partial", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
        ],
        maxBeat: 2,
      };

      const iterator = new ClickIterator(sequence);

      // 2 complete loops + 1 beat into third loop
      const clicks = iterator.getClicksUpto(5);
      expect(clicks).toHaveLength(5); // (2 × 2) + 1
    });
  });

  describe("edge cases", () => {
    it("should handle empty sequence", () => {
      const sequence: Sequence = {
        clicks: [],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);
      const clicks = iterator.getClicksUpto(4);
      expect(clicks).toHaveLength(0);
    });

    it("should handle maxBeat of 0", () => {
      const sequence: Sequence = {
        clicks: [{ soundType: "synth1", beat: 0, volume: 1.0 }],
        maxBeat: 0,
      };

      const iterator = new ClickIterator(sequence);
      const clicks = iterator.getClicksUpto(1);
      expect(clicks).toHaveLength(0);
    });

    it("should handle querying same beat twice", () => {
      const sequence: Sequence = {
        clicks: [{ soundType: "synth1", beat: 0, volume: 1.0 }],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);
      iterator.getClicksUpto(1);
      const clicks = iterator.getClicksUpto(1);
      expect(clicks).toHaveLength(0);
    });

    it("should handle clicks at exact maxBeat boundary", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 3.99, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);
      const clicks = iterator.getClicksUpto(4);
      expect(clicks).toHaveLength(2);
    });

    it("should preserve click properties (soundType, volume)", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 0.5 },
          { soundType: "synth2", beat: 1, volume: 0.8 },
          { soundType: "sample", beat: 2, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);
      const clicks = iterator.getClicksUpto(3);

      expect(clicks[0].soundType).toBe("synth1");
      expect(clicks[0].volume).toBe(0.5);
      expect(clicks[1].soundType).toBe("synth2");
      expect(clicks[1].volume).toBe(0.8);
      expect(clicks[2].soundType).toBe("sample");
      expect(clicks[2].volume).toBe(1.0);
    });
  });

  describe("reset", () => {
    it("should reset state to beginning", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);
      iterator.getClicksUpto(2);

      iterator.reset();

      const clicks = iterator.getClicksUpto(2);
      expect(clicks).toHaveLength(2);
      expect(clicks[0].beat).toBe(0);
      expect(clicks[1].beat).toBe(1);
    });

    it("should work after reset from far ahead position", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);

      // Advance far ahead
      iterator.getClicksUpto(100);

      // Reset and query from beginning
      iterator.reset();

      const clicks = iterator.getClicksUpto(2);
      expect(clicks).toHaveLength(2);
      expect(clicks[0].beat).toBe(0);
      expect(clicks[1].beat).toBe(1);
    });
  });

  describe("non-monotonic access", () => {
    it("should return empty array when beatUpto goes backwards", () => {
      const sequence: Sequence = {
        clicks: [
          { soundType: "synth1", beat: 0, volume: 1.0 },
          { soundType: "synth1", beat: 1, volume: 1.0 },
          { soundType: "synth1", beat: 2, volume: 1.0 },
        ],
        maxBeat: 4,
      };

      const iterator = new ClickIterator(sequence);

      // Advance to beat 3
      const clicks1 = iterator.getClicksUpto(3);
      expect(clicks1).toHaveLength(3);

      // Try to go backwards to beat 2 - should return empty without changing state
      const clicks2 = iterator.getClicksUpto(2);
      expect(clicks2).toHaveLength(0);

      // Verify state wasn't corrupted - continuing forward should work
      const clicks3 = iterator.getClicksUpto(6);
      expect(clicks3).toHaveLength(2); // beats 4 and 5 (no beat 3 in pattern)
      expect(clicks3[0].beat).toBe(4);
      expect(clicks3[1].beat).toBe(5);
    });
  });
});
