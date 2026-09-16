import { validateBrief } from "./brief.js";
import { RunLedger } from "./budget.js";
import type {
  Brief,
  BudgetPolicy,
  DispatchResult,
  HireDecision,
  RunId,
  WorkerRole,
  WorkerSlot,
} from "./types.js";

export interface HireSignals {
  separable: boolean;
  longRunning: boolean;
  parallelismBenefit: boolean;
}

export interface OrchestratorOptions {
  runId: RunId;
  policy?: BudgetPolicy;
  ledger?: RunLedger;
}

let workerSeq = 0;

export class Orchestrator {
  readonly runId: RunId;
  readonly ledger: RunLedger;
  private workers = new Map<string, WorkerSlot>();

  constructor(opts: OrchestratorOptions) {
    this.runId = opts.runId;
    this.ledger = opts.ledger ?? new RunLedger();
    if (!opts.ledger) {
      this.ledger.registerRun(this.runId, opts.policy);
    } else {
      try {
        this.ledger.getSpend(this.runId);
      } catch {
        this.ledger.registerRun(this.runId, opts.policy);
      }
    }
  }

  /** Hire only when work is separable, long-running, and benefits from parallelism. */
  shouldHire(signals: HireSignals): HireDecision {
    if (!signals.separable) {
      return { hire: false, reason: "work is not separable; prefer one strong agent" };
    }
    if (!signals.longRunning) {
      return { hire: false, reason: "task is short; hiring overhead not justified" };
    }
    if (!signals.parallelismBenefit) {
      return { hire: false, reason: "no parallelism benefit; keep sequential" };
    }
    return { hire: true, reason: "separable, long-running, parallelism benefit" };
  }

  getActiveWorkers(): WorkerSlot[] {
    return [...this.workers.values()];
  }

  hire(role: WorkerRole = "general", remote = false): WorkerSlot {
    const active = this.workers.size;
    if (!this.ledger.canHire(this.runId, active)) {
      const hard = this.ledger.getHardMaxWorkers(this.runId);
      throw new Error(`refusing hire: hard max workers reached (${hard})`);
    }
    workerSeq += 1;
    const slot: WorkerSlot = {
      id: `w-${workerSeq}`,
      role,
      hiredAt: Date.now(),
      remote,
    };
    this.workers.set(slot.id, slot);
    return slot;
  }

  release(workerId: string): boolean {
    return this.workers.delete(workerId);
  }

  dispatch(
    brief: Brief,
    options?: { remote?: boolean; hireSignals?: HireSignals },
  ): DispatchResult {
    const check = validateBrief(brief);
    if (!check.valid) {
      return {
        ok: false,
        brief,
        mode: "rejected",
        reason: check.errors.join("; "),
      };
    }

    const next = this.ledger.shouldAllowNext(this.runId);
    if (!next.allow) {
      return {
        ok: false,
        brief,
        mode: "rejected",
        reason: next.reason,
      };
    }

    const remote = options?.remote === true;
    if (remote) {
      const signals = options?.hireSignals ?? {
        separable: true,
        longRunning: true,
        parallelismBenefit: true,
      };
      const decision = this.shouldHire(signals);
      if (!decision.hire) {
        return {
          ok: false,
          brief,
          mode: "rejected",
          reason: decision.reason,
        };
      }
      if (!this.ledger.canHire(this.runId, this.workers.size)) {
        return {
          ok: false,
          brief,
          mode: "rejected",
          reason: "hard max workers reached",
        };
      }
      const slot = this.hire(brief.role ?? "general", true);
      this.ledger.recordStep(this.runId);
      return {
        ok: true,
        brief,
        mode: "remote_intent",
        workerId: slot.id,
        reason: "recorded remote hire intent (no network)",
      };
    }

    this.ledger.recordStep(this.runId);
    const stub = `[local stub] goal=${brief.goal} | success=${brief.success}`;
    return {
      ok: true,
      brief,
      mode: "local",
      stubOutput: stub,
    };
  }

  consolidate(results: string[]): string {
    const seen = new Set<string>();
    const lines: string[] = [];
    for (const r of results) {
      const line = (r ?? "").trim();
      if (!line || seen.has(line)) continue;
      seen.add(line);
      lines.push(line);
    }
    return lines.join("\n");
  }
}
