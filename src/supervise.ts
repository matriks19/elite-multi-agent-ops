import type { InterventionAction } from "./types.js";

const ERROR_PATTERNS: RegExp[] = [
  /\b(error|exception|traceback|fatal)\b/i,
  /\bfailed\b/i,
  /\bECONNREFUSED\b/,
  /\bTypeError\b/,
  /\bReferenceError\b/,
  /\bENOENT\b/,
];

export function detectError(text: string): boolean {
  if (!text) return false;
  return ERROR_PATTERNS.some((re) => re.test(text));
}

/** Same signature appearing ≥3 times indicates a loop. */
export function detectLoop(recentSignatures: string[]): boolean {
  if (recentSignatures.length < 3) return false;
  const counts = new Map<string, number>();
  for (const sig of recentSignatures) {
    const n = (counts.get(sig) ?? 0) + 1;
    counts.set(sig, n);
    if (n >= 3) return true;
  }
  return false;
}

export function detectOversizedObservation(
  text: string,
  maxChars = 8000,
): boolean {
  return (text?.length ?? 0) > maxChars;
}

export function decideIntervention(flags: {
  error?: boolean;
  loop?: boolean;
  oversized?: boolean;
}): InterventionAction {
  if (flags.loop) return "halt";
  if (flags.error) return "provide_guidance";
  if (flags.oversized) return "correct_observation";
  return "approve";
}
