# OpenClaude Agents

Specialized behavioral agents for planning, execution, debugging, and code review. Each agent is a markdown specification that defines how Claude behaves when spawned for that specific role.

## Structure

Each agent has its own `.md` file with:
- **YAML frontmatter** — `name`, `description`, `tools`, `color`
- **XML body** — `<role>`, `<workflow>`, `<success_criteria>` and domain-specific sections
- **Completion markers** — H2 markers like `## PLANNING COMPLETE` that orchestrators detect

## Agents

### openclaude-planner
**Purpose:** Creates executable phase plans with task breakdown, dependency analysis, and goal-backward verification.

**Completion marker:** `## PLANNING COMPLETE`

**When to use:** When you need to plan implementation of a feature, phase, or major refactoring

**Outputs:** PLAN.md with frontmatter, tasks, success criteria, verification steps

**Example:**
```
planner: "Create a plan for implementing user authentication with JWT tokens. Phase: auth"
→ Returns PLAN.md with task breakdown, dependencies, execution waves
```

---

### openclaude-executor
**Purpose:** Executes OpenClaude plans with atomic commits, deviation handling, checkpoint protocols, and state management.

**Completion markers:** `## PLAN COMPLETE`, `## CHECKPOINT REACHED`

**When to use:** When you have a PLAN.md and need to execute it atomically with per-task commits

**Outputs:** Per-task git commits, SUMMARY.md with execution record

**Example:**
```
executor: "@PLAN.md"
→ Executes each task, commits per task, creates SUMMARY.md
```

---

### openclaude-debugger
**Purpose:** Investigates bugs using scientific method: hypothesis → prediction → test → observe → conclude.

**Completion markers:** `## DEBUG COMPLETE`, `## ROOT CAUSE FOUND`, `## CHECKPOINT REACHED`

**When to use:** When you have a bug to investigate and need systematic hypothesis-driven debugging

**Outputs:** Root cause identified, fix implemented, tests passing

**Example:**
```
debugger: "POST /api/users returns 500 error. Error message: 'ReferenceError: user is not defined'"
→ Generates hypotheses, tests them, identifies root cause, implements fix
```

---

### openclaude-code-reviewer
**Purpose:** Automated code audit with bug detection, security checks (OWASP top 10), code quality analysis, and style compliance.

**Completion marker:** `## REVIEW COMPLETE`

**When to use:** When you need automated code review of changed files for bugs, security, and quality issues

**Outputs:** REVIEW.md with severity-classified findings (Critical, High, Medium, Low)

**Example:**
```
code-reviewer: "Review src/api/auth.ts for security issues"
→ Returns REVIEW.md with findings categorized by severity and type
```

---

## Quality Standard

All agents meet:
- ✅ Required XML tags (`<role>`, `<success_criteria>`)
- ✅ Domain-specific sections (workflow, process, checks)
- ✅ Clear completion markers
- ✅ Concrete examples when applicable
- ✅ No markdown headings in XML body (pure XML structure)
- ✅ YAML frontmatter valid

## Adding New Agents

**Pattern:**
1. Create `{name}.md` with YAML frontmatter + XML body
2. Add entry to `manifest.json`
3. Update this README
4. Create TypeScript skill registration in `src/skills/bundled/{name}.ts`

**Minimal agent template:**
```markdown
---
name: openclaude-{name}
description: [One sentence purpose]
tools: [Comma-separated list]
color: [green|yellow|red|blue]
---

<role>
You are an OpenClaude [agent type]. Your job: [specific responsibility].

**CRITICAL: Mandatory Initial Read**
If the prompt contains a `<files_to_read>` block, you MUST use the `Read` tool to load every file listed there before performing any other actions.
</role>

<success_criteria>
[Agent type] is complete when:
- ✅ [Criteria 1]
- ✅ [Criteria 2]
</success_criteria>
```

## Integration

Agents integrate with:
- **CLI commands** — `.openclaude/command/` can invoke agents
- **Skills system** — Agents are registered as bundled skills in `src/skills/bundled/`
- **Workflows** — Agents are spawned by orchestrators (future: workflow engine)
- **Provider management** — Agents validate provider configs

## Metrics

| Agent | Category | Lines | Complexity |
|-------|----------|-------|-----------|
| openclaude-planner | Planning | ~320 | High |
| openclaude-executor | Execution | ~240 | High |
| openclaude-debugger | Debugging | ~200 | High |
| openclaude-code-reviewer | Review | ~260 | High |

Target: All agents <400 lines (content-dense, not verbose)

## Related

- [Skills Reference](../skills/) — Reusable context optimization and quality utilities
- [Commands Reference](../command/) — CLI commands for provider, diagnostics, benchmarks
- [Provider Management](../../src/provider-management/) — Core provider orchestration
