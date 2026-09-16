# Architecture

```
┌─────────────────────────────────────────┐
│              Orchestrator               │
│  shouldHire → hire/release → dispatch   │
│              consolidate                │
└────────────┬────────────┬───────────────┘
             │            │
     ┌───────▼──────┐ ┌───▼────────────┐
     │  RunLedger   │ │  Brief layer   │
     │  budgets &   │ │  build/validate│
     │  worker caps │ └────────────────┘
     └──────────────┘
             │
     ┌───────▼──────────────┐
     │  supervise filters   │
     │  error/loop/oversized│
     │  → InterventionAction│
     └──────────────────────┘
```

## Principles

1. **No network in core** — `dispatch` returns local stubs or records remote hire *intent*; callers wire real workers.
2. **Prefer one agent** — hire only when `separable && longRunning && parallelismBenefit`.
3. **Caps** — soft max 2, hard max 4 workers (overridable via `BudgetPolicy`).
4. **Intervene sparingly** — approve by default; halt on loops; guide on errors; correct oversized observations.
5. **Budgets** — optional `maxTokens` / `maxSteps` halt further steps via `shouldAllowNext`.

## Module map

| File | Role |
| --- | --- |
| `src/types.ts` | Shared types |
| `src/brief.ts` | Brief construction & validation |
| `src/budget.ts` | `RunLedger` |
| `src/supervise.ts` | Pure observation filters |
| `src/orchestrator.ts` | Hire / dispatch / consolidate |
| `src/index.ts` | Public API |

## Related reading

- [LangChain multi-agent](https://docs.langchain.com/oss/python/langchain/multi-agent)
- [SupervisorAgent](https://github.com/LINs-lab/SupervisorAgent)
- [TokenOps](https://github.com/theagentplane/tokenops)
