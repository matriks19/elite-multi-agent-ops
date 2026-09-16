import type { Brief } from "./types.js";

export function buildBrief(input: {
  goal: string;
  success: string;
  context?: string | string[];
  constraints?: string[];
  role?: Brief["role"];
}): Brief {
  const brief: Brief = {
    goal: input.goal.trim(),
    success: input.success.trim(),
  };
  if (input.context !== undefined) brief.context = input.context;
  if (input.constraints !== undefined) brief.constraints = input.constraints;
  if (input.role !== undefined) brief.role = input.role;
  return brief;
}

export function validateBrief(brief: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!brief || typeof brief !== "object") {
    return { valid: false, errors: ["brief must be an object"] };
  }
  const b = brief as Record<string, unknown>;

  if (typeof b.goal !== "string" || !b.goal.trim()) {
    errors.push("goal is required (non-empty string)");
  }
  if (typeof b.success !== "string" || !b.success.trim()) {
    errors.push("success is required (non-empty string)");
  }
  if (b.context !== undefined) {
    const ok =
      typeof b.context === "string" ||
      (Array.isArray(b.context) &&
        b.context.every((c) => typeof c === "string"));
    if (!ok) errors.push("context must be a string or string[]");
  }
  if (b.constraints !== undefined) {
    if (
      !Array.isArray(b.constraints) ||
      !b.constraints.every((c) => typeof c === "string")
    ) {
      errors.push("constraints must be string[]");
    }
  }

  return { valid: errors.length === 0, errors };
}
