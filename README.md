# elite-multi-agent-ops

Anti-waste **multi-agent orchestrator** toolkit: supervisor-as-tools, run-level budgets, tight briefs, and runtime guards against token burn.

> Status: scaffold — implementation in progress via Cursor cloud agent.

## Goals
- Prefer **one strong agent**; hire specialists only when work is separable and long-running
- Cap workers (soft max 2, hard max 4 unless user multitasks)
- Pass **focused briefs**, not full chat history
- Intervene on **errors / loops / oversized observations** only
- Enforce optional **run-level token/time budgets**

## Research anchors
- [SupervisorAgent](https://github.com/LINs-lab/SupervisorAgent) — runtime supervision, ~30% token savings (ICLR 2026 paper)
- [TokenOps](https://github.com/theagentplane/tokenops) — run-aware token governance
- [LangChain multi-agent / supervisor-as-tools](https://docs.langchain.com/oss/python/langchain/multi-agent) — workers as tools, not legacy handoff graphs
- Hyperloom / token-budget orchestrator patterns — shared state & per-agent caps

## Planned layout
```
src/
  orchestrator/   # Coordinator, hire/resume, soft caps
  brief/          # Brief template + validation
  budget/         # Run ledger + halt/mutate hooks
  supervise/      # Loop/error/oversized-observation filters
docs/
  ARCHITECTURE.md
  RESEARCH.md
```

## License
MIT