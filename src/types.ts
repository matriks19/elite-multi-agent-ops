/** Opaque run identifier. */
export type RunId = string;

/** Focused task brief passed to a worker (not full chat history). */
export interface Brief {
  goal: string;
  success: string;
  context?: string | string[];
  constraints?: string[];
  role?: WorkerRole;
}

export type WorkerRole =
  | "researcher"
  | "coder"
  | "reviewer"
  | "planner"
  | "general"
  | (string & {});

export interface HireDecision {
  hire: boolean;
  reason: string;
}

export interface BudgetPolicy {
  softMaxWorkers?: number;
  hardMaxWorkers?: number;
  maxTokens?: number;
  maxSteps?: number;
}

export type InterventionAction =
  | "approve"
  | "provide_guidance"
  | "correct_observation"
  | "halt";

export interface WorkerSlot {
  id: string;
  role: WorkerRole;
  hiredAt: number;
  remote?: boolean;
}

export interface DispatchResult {
  ok: boolean;
  brief: Brief;
  mode: "local" | "remote_intent" | "rejected";
  workerId?: string;
  reason?: string;
  stubOutput?: string;
}
