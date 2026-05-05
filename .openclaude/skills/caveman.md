# caveman

Token compression skill. Shrink context, save tokens, preserve accuracy.

---

<objective>
Compress prose while keeping technical accuracy. Three levels: lite (40%), mid (60%), ultra (75%). Useful for compressing CLAUDE.md, memory files, documentation. Preserves code blocks, URLs, file paths, library names, version numbers.
</objective>

<quick_start>
```typescript
import { compress } from '@openclaude/skills/caveman';

const original = `
OpenClaude is a comprehensive local LLM management system...
It provides sophisticated provider orchestration with quota caching...
`;

const compressed = compress(original, 'ultra');
// Result: 75% fewer tokens, same meaning
```

Three intensity levels:
- **lite**: 40% reduction. Safe for all content. Minimum style changes.
- **mid**: 60% reduction. General purpose. Some style change.
- **ultra**: 75% reduction. Max compression. Caveman prose style.
</quick_start>

<context>
Claude reads project memory files (CLAUDE.md, todos, preferences) at every session start. A 1000-token file costs tokens every session. Over 100 sessions that's 100,000 tokens of overhead — just context you already wrote.

Caveman compression preserves information while reducing token cost. Same instructions. Same accuracy. Less waste.

Compression rules:
- ✅ Preserve: code blocks, inline code, URLs, file paths, commands, library names, version numbers, headings (exact text), table structure, dates
- ✅ Compress: Natural language prose, explanations, descriptions, whitespace, comments
- ❌ Never touch: Security-critical instructions, irreversible action confirmations
</context>

<workflow>
**Step 1: Analyze structure**
Detect file type. Skip binary, code files, backups.

**Step 2: Compress**
Apply intensity level. One Claude API call.

**Step 3: Validate**
Check: headings present, code blocks intact, URLs valid, file paths intact, table structure preserved.

**Step 4: Fix & retry**
If validation fails, cherry-pick issues and fix only broken parts. Max 2 retries.

**Step 5: Write**
- `CLAUDE.md` ← Compressed (Claude reads this)
- `CLAUDE.original.md` ← Human-readable backup (you edit this)
</workflow>

<intensity_levels>
**lite** — 40% reduction
- Strip unnecessary words
- Combine sentences
- Keep full explanation structure
- Example: "I strongly prefer TypeScript with strict mode" → "Prefer TypeScript strict mode"

**mid** — 60% reduction
- Compress descriptions to key points only
- Remove examples unless critical
- Abbreviate explanations
- Example: "I find that taking time to properly type things catches bugs early" → "Proper types catch bugs early"

**ultra** — 75% reduction
- Caveman-style prose
- One clause per concept
- Abbreviate identifier names
- Example: "OpenClaude is a comprehensive system that provides X and Y" → "OpenClaude: X + Y"
</intensity_levels>

<examples>
**Original (706 tokens)**
```
I strongly prefer TypeScript with strict mode enabled for all new code. 
Please don't use `any` type unless there's genuinely no way around it, 
and if you do, leave a comment explaining the reasoning. 
I find that taking the time to properly type things catches a lot of 
bugs before they ever make it to runtime.
```

**Lite (60% reduction)**
```
Prefer TypeScript strict mode. No `any` unless unavoidable — comment why.
Proper types catch bugs early.
```

**Ultra (75% reduction)**
```
TypeScript strict. No `any` (comment if needed). Types = early bug catch.
```

**Validation checks**
```
Input: "## Quick Start\n\nRun `npm install`. Then `npm start`."
Output after lite: "## Quick Start\n\nRun: `npm install` → `npm start`"
✅ Heading preserved exactly
✅ Code blocks intact
✅ Command syntax preserved
```
</examples>

<success_criteria>
Skill works when:
- ✅ Output is valid markdown/text (no corrupted structure)
- ✅ Code blocks unchanged
- ✅ URLs/file paths preserved exactly
- ✅ Technical terms kept (library names, API names, version numbers)
- ✅ Compression ratio matches intensity level (±5%)
- ✅ Human-readable backup created (*.original.md)
- ✅ Original never lost (can edit backup and re-compress)
</success_criteria>

<validation>
Before compression, verify:
- [ ] File is text/markdown (skip binary, code files, backups)
- [ ] File has content (>50 tokens worth compressing)
- [ ] No security-critical instructions about irreversible actions
- [ ] No encrypted/sensitive content

After compression, verify:
- [ ] All markdown headings present and exact text preserved
- [ ] All code blocks (``` fenced or indented) intact
- [ ] All URLs valid format preserved
- [ ] All file paths (/) valid format preserved
- [ ] All commands (npm, git, bun, etc.) preserved
- [ ] Table structure intact
- [ ] Bullet lists readable
- [ ] No truncation or corruption
</validation>

<limitations>
- Works best on natural language prose (docs, memory files, preferences)
- Code files (*.ts, *.js, *.py, *.json, *.yaml) skipped automatically
- Security-critical content (credential handling, reversible actions) preserved verbatim
- First-time compression may need one retry if validation fails
- Backup files (*.original.md) never compressed (prevents loops)
</limitations>

<related_skills>
- `provider:status` — Check key health without re-reading long logs
- `doctor:runtime` — Quick health check (uses caveman in output)
- CLI commands — Use caveman style for concise output
</related_skills>
