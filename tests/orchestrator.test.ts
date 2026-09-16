import { describe, expect, it } from "vitest";
import { buildBrief } from "../src/brief.js";
import { Orchestrator } from "../src/orchestrator.js";

describe("Orchestrator", () => {
  it("shouldHire requires all three signals", () => {
    const orch = new Orchestrator({ runId: "r1" });
    expect(
      orch.shouldHire({
        separable: false,
        longRunning: true,
        parallelismBenefit: true,
      }).hire,
    ).toBe(false);
    expect(
      orch.shouldHire({
        separable: true,
        longRunning: false,
        parallelismBenefit: true,
      }).hire,
    ).toBe(false);
    expect(
      orch.shouldHire({
        separable: true,
        longRunning: true,
        parallelismBenefit: false,
      }).hire,
    ).toBe(false);
    expect(
      orch.shouldHire({
        separable: true,
        longRunning: true,
        parallelismBenefit: true,
      }).hire,
    ).toBe(true);
  });

  it("refuses hire above hard max", () => {
    const orch = new Orchestrator({
      runId: "r1",
      policy: { hardMaxWorkers: 2 },
    });
    orch.hire("coder");
    orch.hire("reviewer");
    expect(() => orch.hire("planner")).toThrow(/hard max/);
  });

  it("dispatch rejects invalid brief and respects budget", () => {
    const orch = new Orchestrator({
      runId: "r1",
      policy: { maxSteps: 1 },
    });
    const bad = orch.dispatch({ goal: "", success: "" } as never);
    expect(bad.ok).toBe(false);
    expect(bad.mode).toBe("rejected");

    const brief = buildBrief({ goal: "g", success: "s" });
    const ok = orch.dispatch(brief);
    expect(ok.ok).toBe(true);
    expect(ok.mode).toBe("local");
    expect(ok.stubOutput).toBeTruthy();

    const blocked = orch.dispatch(brief);
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toMatch(/step/);
  });

  it("consolidate joins and dedupes empty", () => {
    const orch = new Orchestrator({ runId: "r1" });
    expect(orch.consolidate(["a", "", "  ", "a", "b"])).toBe("a\nb");
  });

  it("release removes worker", () => {
    const orch = new Orchestrator({ runId: "r1" });
    const w = orch.hire();
    expect(orch.getActiveWorkers()).toHaveLength(1);
    expect(orch.release(w.id)).toBe(true);
    expect(orch.getActiveWorkers()).toHaveLength(0);
  });
});
