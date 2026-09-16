import type { BudgetPolicy, RunId } from "./types.js";

const DEFAULT_POLICY: Required<
  Pick<BudgetPolicy, "softMaxWorkers" | "hardMaxWorkers">
> &
  BudgetPolicy = {
  softMaxWorkers: 2,
  hardMaxWorkers: 4,
};

interface RunState {
  policy: BudgetPolicy & {
    softMaxWorkers: number;
    hardMaxWorkers: number;
  };
  tokensSpent: number;
  steps: number;
}

export class RunLedger {
  private runs = new Map<RunId, RunState>();

  registerRun(runId: RunId, policy?: BudgetPolicy): void {
    this.runs.set(runId, {
      policy: {
        softMaxWorkers: policy?.softMaxWorkers ?? DEFAULT_POLICY.softMaxWorkers,
        hardMaxWorkers: policy?.hardMaxWorkers ?? DEFAULT_POLICY.hardMaxWorkers,
        maxTokens: policy?.maxTokens,
        maxSteps: policy?.maxSteps,
      },
      tokensSpent: 0,
      steps: 0,
    });
  }

  recordSpend(runId: RunId, tokens: number): void {
    const run = this.require(runId);
    if (tokens < 0) throw new Error("tokens must be non-negative");
    run.tokensSpent += tokens;
  }

  recordStep(runId: RunId): void {
    const run = this.require(runId);
    run.steps += 1;
  }

  canHire(runId: RunId, activeWorkers: number): boolean {
    const run = this.require(runId);
    return activeWorkers < run.policy.hardMaxWorkers;
  }

  shouldAllowNext(runId: RunId): { allow: boolean; reason?: string } {
    const run = this.require(runId);
    const { maxTokens, maxSteps } = run.policy;
    if (maxTokens !== undefined && run.tokensSpent >= maxTokens) {
      return { allow: false, reason: `token budget exhausted (${run.tokensSpent}/${maxTokens})` };
    }
    if (maxSteps !== undefined && run.steps >= maxSteps) {
      return { allow: false, reason: `step budget exhausted (${run.steps}/${maxSteps})` };
    }
    return { allow: true };
  }

  getSoftMaxWorkers(runId: RunId): number {
    return this.require(runId).policy.softMaxWorkers;
  }

  getHardMaxWorkers(runId: RunId): number {
    return this.require(runId).policy.hardMaxWorkers;
  }

  getSpend(runId: RunId): { tokens: number; steps: number } {
    const run = this.require(runId);
    return { tokens: run.tokensSpent, steps: run.steps };
  }

  private require(runId: RunId): RunState {
    const run = this.runs.get(runId);
    if (!run) throw new Error(`unknown run: ${runId}`);
    return run;
  }
}
