# Phase 1: Foundation Implementation Plan
**Duration:** 2 weeks | **Goal:** Extract Portal_AI modules + port GSD agents + establish skill infrastructure

---

## Overview
Phase 1 establishes the infrastructure for provider orchestration, agent automation, and skill execution. Four concurrent workstreams:

| Workstream | Owner | Days | Output |
|-----------|-------|------|--------|
| **Provider Mgmt** | Extract Portal_AI modules | 4-5 | `src/provider-management/` (5 modules) |
| **Agent Core** | Port GSD agents | 5-6 | `.openclaude/agents/` (4 agents + manifest) |
| **Skill Layer** | Caveman + registry | 3-4 | `.openclaude/skills/` + caveman.md |
| **CLI Pattern** | Command registry | 2-3 | `.openclaude/command/` structure |

---

## Workstream 1: Provider Management (QuotaCache, LockoutPolicy, etc.)

### Task 1.1: Create `src/provider-management/` module structure
```bash
src/provider-management/
├── index.ts              # Public API + exports
├── types.ts              # Shared interfaces (ProviderKey, Budget, Quota, etc.)
├── quotaCache.ts         # QuotaCache class (5-min TTL, 90% API call reduction)
├── lockoutPolicy.ts      # LockoutPolicy (escalating blacklist)
├── costRules.ts          # CostRules (per-key budget tracking)
├── degradation.ts        # Degradation (fallback chains)
├── keyRotator.ts         # KeyRotator (priority-based selection)
└── __tests__/
    ├── quotaCache.test.ts
    ├── lockoutPolicy.test.ts
    └── integration.test.ts
```

**Effort:** 1 day | **Success Criteria:** Modules compile, types exported

### Task 1.2: Implement QuotaCache
- **Source:** Portal_AI backend `provider-orchestrator/cache.ts`
- **Key methods:** `getQuota()`, `updateQuota()`, `isStale()`, `invalidate()`
- **Spec:** 5-min TTL, 90%+ API reduction vs naive polling
- **Test:** Cache hit/miss, TTL expiry, concurrent updates
- **Effort:** 1 day

### Task 1.3: Implement LockoutPolicy
- **Source:** Portal_AI backend `provider-orchestrator/lockout.ts`
- **Key methods:** `recordFailure()`, `isLocked()`, `resetFailures()`
- **Config:** Base = 3 failures → 15min → 1.5x multiplier → 24hr max
- **Test:** Escalation timing, concurrent failures, reset logic
- **Effort:** 1.5 days

### Task 1.4: Implement CostRules + Degradation
- **CostRules:** Per-key budget, spending tracking, daily reset
- **Degradation:** FallbackChain interface, routeWithFallback() async function
- **Test:** Budget enforcement, fallback ordering, chain exhaustion
- **Effort:** 1.5 days

### Task 1.5: Implement KeyRotator
- **Source:** Portal_AI backend `provider-orchestrator/key-selector.ts`
- **Key method:** `selectKey(provider, weights)` → ProviderKey
- **Priority:** Health score, cost, quota availability
- **Test:** Weight-based selection, health updates, edge cases
- **Effort:** 0.5 days

### Task 1.6: Integration tests + docs
- Test all modules together (cache + policy + routing)
- Document `src/provider-management/README.md` with usage examples
- Effort: 1 day

**Workstream 1 Total:** 5 days | **Deliverable:** Fully tested provider orchestration layer

---

## Workstream 2: GSD Agent Core

### Task 2.1: Create `.openclaude/agents/` structure
```
.openclaude/agents/
├── AGENTS.md          # Agent catalog + style guide (inspired by OpenCode)
├── manifest.json      # Agent registry (name, type, capabilities)
├── shared/
│   ├── types.ts       # AgentTask, Checkpoint, ExecutionState
│   └── utils.ts       # Common helpers (exec, writeFile, git ops)
├── planner.ts         # gsd-planner: task decomposition
├── executor.ts        # gsd-executor: atomic commits, state mgmt
├── debugger.ts        # gsd-debugger: hypothesis-driven debugging
├── code-reviewer.ts   # gsd-code-reviewer: automated audits
└── __tests__/         # Unit tests per agent
```

**Effort:** 1 day | **Success Criteria:** Module layout matches `.opencode/` pattern

### Task 2.2: Port gsd-planner
- **Source:** `get-shit-done` GitHub project (analyze agent structure)
- **Responsibility:** Parse task → decompose into subtasks → create dependency graph
- **Key method:** `plan(goal: string): Task[]`
- **Input/Output:** Natural language goal → structured task list with deps
- **Effort:** 2 days

### Task 2.3: Port gsd-executor
- **Responsibility:** Execute tasks atomically, manage checkpoints, handle rollback
- **Key methods:** `execute(tasks)`, `checkpoint()`, `resume(checkpointId)`
- **Features:** Atomic git commits per task, state persistence, failure recovery
- **Effort:** 2 days

### Task 2.4: Port gsd-debugger
- **Responsibility:** Hypothesis-driven debugging (formulate hypothesis → test → refine)
- **Key method:** `debug(problem: string, code: string): Solution`
- **Test:** Synthetic bug cases, hypothesis formation, iterative refinement
- **Effort:** 1.5 days

### Task 2.5: Port gsd-code-reviewer
- **Responsibility:** Automated code audit (security, quality, patterns)
- **Key method:** `review(code: string, context): ReviewResult`
- **Checks:** Type safety, common pitfalls, OWASP top 10, style adherence
- **Effort:** 1.5 days

### Task 2.6: Create AGENTS.md + manifest
- Document agent APIs, usage, examples
- Create manifest.json with agent metadata
- Add to help system
- **Effort:** 1 day

**Workstream 2 Total:** 6 days | **Deliverable:** 4 GSD agents ported + documented

---

## Workstream 3: Skill Layer

### Task 3.1: Create `.openclaude/skills/` structure
```
.openclaude/skills/
├── README.md          # Skill system overview
├── caveman.md         # Token compression skill (75% reduction)
├── skill-auditor.md   # Code quality audits (from taches-cc-resources)
├── registry.json      # Skill manifest (name, description, cost)
└── examples/
    ├── caveman-example.md
    └── auditor-example.md
```

**Effort:** 0.5 days

### Task 3.2: Port caveman skill
- **Source:** `caveman` GitHub project
- **Responsibility:** Token compression while preserving technical accuracy
- **Levels:** lite (40%), mid (60%), ultra (75%)
- **Method:** Strip comments, compress whitespace, inline single-use vars, abbreviate identifiers
- **Test:** Compression ratio, accuracy preservation, example transformations
- **Effort:** 1.5 days

### Task 3.3: Port skill-auditor
- **Source:** `taches-cc-resources` → skill-auditor.md
- **Responsibility:** Audit skill definitions for quality/completeness
- **Checks:** Documentation completeness, example coverage, type safety
- **Effort:** 1 day

### Task 3.4: Skill registry + docs
- Implement skill loading/caching system
- Document in `.openclaude/skills/README.md`
- Add to help system
- **Effort:** 0.5 days

**Workstream 3 Total:** 3.5 days | **Deliverable:** Caveman + auditor skills + registry

---

## Workstream 4: CLI Command Pattern

### Task 4.1: Create `.openclaude/command/` structure (OpenCode pattern)
```
.openclaude/command/
├── README.md
├── profile.md         # Model profile commands
├── doctor.md          # Diagnostics (existing)
├── provider.md        # NEW: Provider management commands
├── benchmark.md       # NEW: Performance testing
├── release.md         # NEW: Release automation
└── __registry__.json  # Command manifest
```

**Effort:** 1 day | **Success Criteria:** Structure matches OpenCode pattern

### Task 4.2: Document command registry
- Create `doctor.md` (existing doctor:runtime command)
- Create `provider.md` (list keys, check quotas, test routing)
- Create `benchmark.md` (compare providers, profile costs)
- Create `release.md` (release checklist, changelog gen)
- **Effort:** 1.5 days

### Task 4.3: Update CONTRIBUTING.md + help system
- Add reference to `.openclaude/command/`
- Update help text to use command registry
- Add design gate rules (inspired by OpenCode)
- **Effort:** 1 day

**Workstream 4 Total:** 3.5 days | **Deliverable:** Command registry + docs

---

## Cross-Cutting Concerns

### Testing Strategy
- **Unit tests:** Per module (provider-mgmt modules, agents, skills)
- **Integration tests:** Module interactions (cache + policy + routing)
- **E2E tests:** Full workflow (plan → execute → review)
- **Benchmark:** Provider response times, cache efficiency, key rotation

### Documentation
- README for each major module (`src/provider-management/README.md`, `.openclaude/agents/README.md`)
- Examples in each `.md` file (caveman.md, skill-auditor.md, etc.)
- Updated PLAYBOOK.md with new workflows
- Updated CONTRIBUTING.md with design gates + skill guidelines

### Quality Gates
- TypeScript strict mode, all public APIs typed
- ESLint + code style (no `any`, early returns, etc. from OpenCode pattern)
- Pre-commit hook: lint + type check + test
- No merges until all tests pass + code review

---

## Success Criteria (Phase 1 Complete)

- ✅ `src/provider-management/` fully implemented + tested (5 modules, ~500 LOC each)
- ✅ 4 GSD agents ported (planner, executor, debugger, reviewer)
- ✅ Caveman skill + skill-auditor implemented
- ✅ `.openclaude/command/` structure + 4 core commands documented
- ✅ All modules TypeScript strict, no warnings
- ✅ Unit + integration tests ≥80% coverage
- ✅ PLAYBOOK.md + CONTRIBUTING.md updated

---

## Timeline (2 Weeks)

### Week 1
- **Mon-Tue:** Workstream 1.1-1.2 (module setup + QuotaCache) + Workstream 2.1 (agent structure) + Workstream 4.1 (command structure)
- **Wed-Thu:** Workstream 1.3-1.5 (LockoutPolicy + Degradation + KeyRotator) + Workstream 2.2 (planner agent)
- **Fri:** Workstream 1.6 (integration tests) + Workstream 3.1-3.2 (caveman skill setup)

### Week 2
- **Mon-Tue:** Workstream 2.3-2.4 (executor + debugger) + Workstream 3.3 (auditor)
- **Wed-Thu:** Workstream 2.5-2.6 (reviewer + AGENTS.md) + Workstream 4.2-4.3 (command docs + CONTRIBUTING)
- **Fri:** Cross-cutting: docs, testing, QA gates, final review

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Agent porting too complex | Start with planner only; defer debugger if needed |
| Test coverage lag | Write tests alongside code, not after |
| Scope creep (nice-to-haves) | Freeze at end of week 1; defer to Phase 2 |
| Documentation drift | Update docs in same PR as code |

---

## What Happens After Phase 1?

**Phase 2 (Weeks 3-4):** Integrate agents with executor + add automated workflows  
**Phase 3 (Weeks 5-6):** CLI enhancements + provider integration  
**Phase 4 (Weeks 7-8):** Testing, hardening, production readiness

---

## Files to Create (Summary)
```
NEW:
  src/provider-management/ (5 .ts files + types, tests)
  .openclaude/agents/ (4 agents + AGENTS.md + manifest)
  .openclaude/skills/ (caveman.md + auditor.md + registry)
  .openclaude/command/ (4 .md files + registry)

MODIFY:
  PLAYBOOK.md (add workflows section)
  CONTRIBUTING.md (add design gates + skill guidelines)
  .github/workflows/pr-checks.yml (add type-check, audit)
```

---

**Next Step:** Review this plan. If aligned, we can start with Workstream 1 (provider-management) immediately.
