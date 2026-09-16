import { describe, expect, it } from "vitest";
import { buildBrief, validateBrief } from "../src/brief.js";

describe("brief", () => {
  it("buildBrief trims goal and success", () => {
    const b = buildBrief({
      goal: "  do thing  ",
      success: "  done  ",
      context: "ctx",
    });
    expect(b.goal).toBe("do thing");
    expect(b.success).toBe("done");
    expect(b.context).toBe("ctx");
  });

  it("validateBrief requires goal and success", () => {
    expect(validateBrief({}).valid).toBe(false);
    expect(validateBrief({ goal: "x" }).valid).toBe(false);
    expect(validateBrief({ goal: "x", success: "y" }).valid).toBe(true);
  });

  it("validateBrief accepts string or string[] context", () => {
    expect(
      validateBrief({ goal: "g", success: "s", context: "one" }).valid,
    ).toBe(true);
    expect(
      validateBrief({ goal: "g", success: "s", context: ["a", "b"] }).valid,
    ).toBe(true);
    expect(
      validateBrief({ goal: "g", success: "s", context: 42 }).valid,
    ).toBe(false);
  });

  it("rejects empty goal/success", () => {
    const r = validateBrief({ goal: "  ", success: "ok" });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.includes("goal"))).toBe(true);
  });
});
