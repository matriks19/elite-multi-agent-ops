# Research anchors

This library encodes anti-waste multi-agent patterns. Core runtime makes **no LLM network calls**.

## Supervisor-as-tools (LangChain)

Coordinator treats workers as **tools**: each call gets a focused brief, not the full conversation history. Prefer one strong agent; hire specialists only when work is separable and long-running.

- Docs: https://docs.langchain.com/oss/python/langchain/multi-agent

## SupervisorAgent (LINs-lab / ICLR 2026)

Intervene **only** on errors, loops, or oversized observations. Claimed ~30% token savings versus naive full-history supervision.

- Repo: https://github.com/LINs-lab/SupervisorAgent

## TokenOps

Run-level budgets with halt / mutate / inject policies. Cap spend and steps before spawning more work.

- Repo: https://github.com/theagentplane/tokenops

## Design takeaways in this package

| Pattern | Mapping |
| --- | --- |
| Focused briefs | `buildBrief` / `validateBrief` |
| Hire gates | `Orchestrator.shouldHire` |
| Soft/hard worker caps | `RunLedger.canHire` (defaults 2 / 4) |
| Error / loop / size filters | `supervise.ts` → `decideIntervention` |
| Run budgets | `RunLedger.shouldAllowNext` |
