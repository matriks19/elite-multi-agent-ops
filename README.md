# elite-multi-agent-ops

Anti-waste **multi-agent orchestrator** toolkit: supervisor-as-tools, run-level budgets, tight briefs, and runtime guards against token burn.

Core library performs **no LLM network calls** — you wire workers; this package decides when to hire, what brief to pass, and when to halt.

## Install

```bash
npm install elite-multi-agent-ops
```

## Usage

```ts
import {
  Orchestrator,
  buildBrief,
  detectLoop,
  decideIntervention,
} from "elite-multi-agent-ops";

const orch = new Orchestrator({
  runId: "run-1",
  policy: { softMaxWorkers: 2, hardMaxWorkers: 4, maxTokens: 50_000 },
});

const decision = orch.shouldHire({
  separable: true,
  longRunning: true,
  parallelismBenefit: true,
});

if (decision.hire) {
  const brief = buildBrief({
    goal: "Summarize repo architecture",
    success: "One-page outline with module map",
    context: ["src/", "docs/ARCHITECTURE.md"],
    role: "researcher",
  });

  const result = orch.dispatch(brief); // local stub; no network
  console.log(result.stubOutput);

  const summary = orch.consolidate([
    result.stubOutput ?? "",
    "Extra note from another worker",
  ]);
  console.log(summary);
}

// Runtime supervision (caller feeds observation text / signatures)
const action = decideIntervention({
  error: false,
  loop: detectLoop(["a", "a", "a"]),
  oversized: false,
});
// action === "halt"
```

## Scripts

```bash
npm install
npm test
npm run build
```

## Docs

- [Architecture](./docs/ARCHITECTURE.md)
- [Research anchors](./docs/RESEARCH.md)

## License

MIT
