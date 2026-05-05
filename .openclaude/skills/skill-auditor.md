# skill-auditor

Expert auditor for Claude Code Skills. Validates SKILL.md files against best practices.

---

<objective>
Audit SKILL.md files for structure, documentation quality, and best practices compliance. Reports critical issues, recommendations, and strengths. Used when creating or reviewing skills.
</objective>

<quick_start>
```bash
bun run skill-auditor {path-to-skill.md} [--verbose]
```

Examples:
```bash
# Audit a skill file
bun run skill-auditor .openclaude/skills/caveman.md

# With details
bun run skill-auditor .openclaude/skills/caveman.md --verbose

# Audit all skills
bun run skill-auditor .openclaude/skills/ --recursive
```

Auditor checks:
1. **YAML Frontmatter** — name, description, metadata
2. **XML Structure** — required tags, proper nesting, no markdown headings in body
3. **Content Quality** — clarity, conciseness, specificity, examples
4. **Anti-patterns** — missing tags, vague descriptions, bad structure
</quick_start>

<context>
Skills in OpenClaude follow pure XML structure (no markdown headings in body). Best practices from taches-cc-resources and OpenCode:

Required tags (all skills):
- `<objective>` — What skill does + why it matters
- `<quick_start>` — Immediate actionable guidance
- `<success_criteria>` — How to know it worked

Conditional tags (as needed):
- `<context>` — Background for understanding
- `<workflow>` — Step-by-step process
- `<examples>` — Concrete, realistic scenarios
- `<validation>` — Pre/post-action checklists
- `<limitations>` — What it can't do
- `<security_checklist>` — For sensitive operations
- `<error_handling>` — Common failure modes

YAML rules:
- `name`: lowercase-with-hyphens, max 64 chars, verb-noun (compress-files, audit-code)
- `description`: max 1024 chars, third person, what + when
</context>

<workflow>
**Step 1: Parse frontmatter**
Extract YAML. Check: name format, description quality, required fields.

**Step 2: Validate XML structure**
- All required tags present?
- Pure XML (no markdown headings ##, ###)?
- All tags properly closed?
- Proper nesting?

**Step 3: Check content**
- Clarity: Direct, specific, no analogies
- Conciseness: Only what Claude doesn't know
- Examples: Concrete, minimal, applicable
- Progressive disclosure: SKILL.md < 500 lines, references one level deep

**Step 4: Find anti-patterns**
- Missing required tags
- Markdown headings in body (should be XML tags)
- Hybrid XML/markdown (mix of styles)
- Vague descriptions ("helps with", "processes data")
- Wrong POV (first/second instead of third)
- Windows paths (backslash instead of forward slash)

**Step 5: Report findings**
Categorize by severity: Critical (blocking), Recommendations (improving), Quick Fixes (easy wins)
</workflow>

<examples>
**Well-formed skill (passes audit)**
```xml
---
name: compress-code
description: Compress source code while preserving syntax. Reduces file size 30-50% via minification and dead-code removal. Use before embedding large files in context.
---

<objective>
Code compression reduces tokens without changing functionality.
</objective>

<quick_start>
compress('code.ts', 'aggressive')
</quick_start>

<success_criteria>
✅ Output is valid syntax (parses)
✅ Compression ratio 30%+
✅ All tests pass
</success_criteria>
```

**Anti-pattern: Markdown headings in body (❌ fails audit)**
```markdown
<objective>
Compress code files
</objective>

## Quick Start    ← ❌ WRONG: Markdown heading in XML body

Extract file, apply compression...

## Advanced Usage

Customize rules...
```

**Should be:**
```xml
<objective>
Compress code files
</objective>

<quick_start>
Extract file, apply compression...
</quick_start>

<advanced_usage>
Customize rules...
</advanced_usage>
```

**Anti-pattern: Missing required tag (❌ fails audit)**
```xml
<quick_start>
Run compress(file)
</quick_start>

<workflow>
1. Parse
2. Minify
3. Write
</workflow>
```

Missing: `<objective>`, `<success_criteria>`

**Anti-pattern: Vague description (⚠️ recommendation)**
```yaml
description: Helps with code optimization and processes files
```

Better: "Compress source code 30-50% via minification. Use before embedding in context to reduce tokens."
</examples>

<success_criteria>
Audit is complete when:
- ✅ YAML frontmatter validated (name, description, format)
- ✅ All required XML tags present and closed properly
- ✅ No markdown headings (##, ###) in body
- ✅ No hybrid XML/markdown mixing
- ✅ Content checked: clarity, conciseness, specificity
- ✅ Anti-patterns identified with file:line locations
- ✅ Report includes: Critical issues, Recommendations, Strengths
- ✅ Findings are actionable (specific fixes, not just complaints)
</success_criteria>

<report_format>
```markdown
## Audit Results: {skill-name}

### Assessment
[1-2 sentence overall assessment]

### Critical Issues
[Issues that hurt effectiveness]
1. **[Category]** (line X)
   - Current: [What exists]
   - Should be: [What's expected]
   - Why: [Impact on skill]
   - Fix: [Specific action]

### Recommendations
[Improvements that would help]
1. **[Category]** (line X)
   - Current: [What exists]
   - Recommendation: [What to change]
   - Benefit: [How it improves]

### Strengths
[What's working well]
- Specific strength with location

### Quick Fixes
[Minor issues easily resolved]
1. [Issue] at line X → [One-line fix]

### Context
- Skill type: [simple/complex/delegation]
- Line count: [number]
- Effort to fix: [low/medium/high]
```
</report_format>

<validation>
Pre-audit checklist:
- [ ] File is SKILL.md or has YAML frontmatter
- [ ] File is readable (not binary, not code-only)
- [ ] YAML frontmatter parses without error
- [ ] At least one XML tag present in body

During audit:
- [ ] All evaluation areas checked (YAML, XML, Content, Anti-patterns)
- [ ] Every finding has file:line location
- [ ] Severity clearly stated (Critical vs Recommendation)
- [ ] Contextual judgment applied (simple vs complex skill)
- [ ] Examples provided where helpful

Post-audit:
- [ ] Report is complete (Assessment + Critical + Recommendations + Strengths)
- [ ] Findings are specific and actionable
- [ ] No arbitrary rules applied without context
- [ ] Next steps clear (which issues to fix first)
</validation>

<limitations>
- Works on SKILL.md files, not arbitrary markdown
- Requires valid YAML frontmatter (will report if missing)
- Checks structure quality, not technical correctness (can't verify if code examples actually work)
- Assumes pure XML structure as standard (flags markdown headings as anti-pattern)
- Doesn't validate external references (only checks they're mentioned)
</limitations>

<related_skills>
- `caveman` — Compress verbose documentation
- `provider:status` — Check skill usage in commands
- `doctor:runtime` — Verify skill system is loaded
</related_skills>
