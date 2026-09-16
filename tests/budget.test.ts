import { describe, expect, it } from "vitest";
import { RunLedger } from "../src/budget.js";

describe("RunLedger", () => {
  it("defaults soft=2 hard=4", () => {
    const ledger = new RunLedger();
    ledger.registerRun("r1");
    expect(ledger.getSoftMaxWorkers("r1")).toBe(2);
    expect(ledger.getHardMaxWorkers("r1")).toBe(4);
    expect(ledger.canHire("r1", 3)).toBe(true);
    expect(ledger.canHire("r1", 4)).toBe(false);
  });

  it("enforces maxTokens", () => {
    const ledger = new RunLedger();
    ledger.registerRun("r1", { maxTokens: 100 });
    ledger.recordSpend("r1", 100);
    const next = ledger.shouldAllowNext("r1");
    expect(next.allow).toBe(false);
    expect(next.reason).toMatch(/token/);
  });

  it("enforces maxSteps", () => {
    const ledger = new RunLedger();
    ledger.registerRun("r1", { maxSteps: 2 });
    ledger.recordStep("r1");
    expect(ledger.shouldAllowNext("r1").allow).toBe(true);
    ledger.recordStep("r1");
    expect(ledger.shouldAllowNext("r1").allow).toBe(false);
  });

  it("allows when under budget", () => {
    const ledger = new RunLedger();
    ledger.registerRun("r1", { maxTokens: 1000, maxSteps: 10 });
    ledger.recordSpend("r1", 10);
    ledger.recordStep("r1");
    expect(ledger.shouldAllowNext("r1")).toEqual({ allow: true });
  });
});
