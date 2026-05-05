# OpenClaude Skills

Reusable utilities for context optimization, code quality, and automation. Inspired by `caveman` and `taches-cc-resources`.

## Structure

Each skill has its own `.md` file with:
- **objective** — What the skill does and why
- **quick_start** — Immediate usage example
- **success_criteria** — How to know it worked
- Optional: **context**, **workflow**, **examples**, **validation**, **limitations**

## Skills

### caveman
**Token compression for prose files** (40-75% reduction)

Shrink CLAUDE.md, memory files, documentation while preserving code blocks, URLs, file paths, library names.

```bash
bun run caveman:compress CLAUDE.md
# Output: CLAUDE.md (compressed) + CLAUDE.original.md (backup)
```

Three intensity levels:
- **lite**: 40% reduction (safe, minimal style change)
- **mid**: 60% reduction (general purpose)
- **ultra**: 75% reduction (caveman prose style)

**When to use:**
- Project memory files loaded every session (CLAUDE.md)
- Documentation shared across sessions
- Long preference files
- Reducing context overhead

---

### skill-auditor
**Quality auditor for SKILL.md files**

Validates skills against best practices: YAML frontmatter, XML structure, content clarity, anti-patterns.

```bash
bun run skill-auditor .openclaude/skills/caveman.md
# Output: Critical issues, Recommendations, Strengths, Quick fixes
```

**Checks:**
- ✅ Required tags present (objective, quick_start, success_criteria)
- ✅ Pure XML structure (no markdown headings in body)
- ✅ Proper tag nesting and closing
- ✅ Concise, clear content
- ❌ Anti-patterns (vague descriptions, missing tags, hybrid styles)

**When to use:**
- Before merging new skills
- Code review for skill documentation
- Ensure consistent structure
- Catch common mistakes early

---

## Adding New Skills

**Pattern:**
1. Create `{name}.md` with YAML frontmatter + XML body
2. Add entry to `registry.json`
3. Update this README
4. Test with `skill-auditor`

**Minimal skill template:**
```markdown
# {skill-name}

One-line description.

---

<objective>
What skill does + why it matters.
</objective>

<quick_start>
Immediate usage example with code.
</quick_start>

<success_criteria>
How to know it worked (checklist).
</success_criteria>
```

**Best practices:**
- Keep SKILL.md under 500 lines (move details to references/)
- Use pure XML (no markdown headings ## in body)
- Third-person POV ("Skill does X" not "I do X")
- Every example must be concrete and tested
- Document limitations upfront
- Include pre/post checklists for complex operations

---

## Integration

Skills integrate with:
- **CLI commands** — `.openclaude/command/` can invoke skills
- **GSD agents** — Agents can call skills for specific tasks
- **Provider management** — Skills validate provider configs
- **Doctor diagnostics** — Skills used in health checks

---

## Quality Standard

All skills meet:
- ✅ Required XML tags (objective, quick_start, success_criteria)
- ✅ Examples are concrete (runnable, not pseudo-code)
- ✅ Limitations documented
- ✅ Success criteria testable
- ✅ YAML frontmatter valid
- ✅ No markdown headings in XML body
- ✅ Passes `skill-auditor` (Critical = 0)

---

## Metrics

| Skill | Type | Lines | Complexity | Passed |
|-------|------|-------|-----------|--------|
| caveman | Context optimization | 180 | Simple | ✅ |
| skill-auditor | Quality assurance | 250 | Medium | ✅ |

Target: All skills pass auditor, <500 lines each, <2 dependencies per skill.

---

## Related

- [Command Registry](../command/) — CLI commands for provider management and diagnostics
- [Agent Framework](../agents/) — GSD-style agents for automation (coming Phase 2)
- [Provider Management](../../src/provider-management/) — Core orchestration modules
