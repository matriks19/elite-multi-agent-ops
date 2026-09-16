import { describe, expect, it } from "vitest";
import {
  decideIntervention,
  detectError,
  detectLoop,
  detectOversizedObservation,
} from "../src/supervise.js";

describe("supervise", () => {
  it("detectError finds common failure markers", () => {
    expect(detectError("TypeError: x is not a function")).toBe(true);
    expect(detectError("all good")).toBe(false);
  });

  it("detectLoop triggers at ≥3 identical signatures", () => {
    expect(detectLoop(["a", "b"])).toBe(false);
    expect(detectLoop(["a", "a"])).toBe(false);
    expect(detectLoop(["a", "a", "a"])).toBe(true);
    expect(detectLoop(["x", "y", "x", "y"])).toBe(false);
    expect(detectLoop(["x", "y", "x", "x", "x"])).toBe(true);
  });

  it("detectOversizedObservation uses maxChars", () => {
    expect(detectOversizedObservation("hi", 10)).toBe(false);
    expect(detectOversizedObservation("a".repeat(8001))).toBe(true);
  });

  it("decideIntervention priority: loop > error > oversized > approve", () => {
    expect(decideIntervention({ loop: true, error: true })).toBe("halt");
    expect(decideIntervention({ error: true })).toBe("provide_guidance");
    expect(decideIntervention({ oversized: true })).toBe("correct_observation");
    expect(decideIntervention({})).toBe("approve");
  });
});
