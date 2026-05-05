# Command: doctor

**Category:** Diagnostics  
**Frequency:** On troubleshoot  
**Requires:** None (runnable offline)

## Purpose

Comprehensive runtime diagnostics. Checks configuration, providers, dependencies, and system health. Safe to run repeatedly.

## Commands

### `doctor:runtime`
Full runtime health check with detailed reports.

```bash
bun run doctor:runtime [--verbose] [--json]
```

**Examples:**
```bash
# Standard check
bun run doctor:runtime

# Detailed output
bun run doctor:runtime --verbose

# Machine-readable
bun run doctor:runtime --json
```

**Output:**
```
OpenClaude Runtime Diagnostics
==============================
Timestamp: 2026-04-29T14:32:18.000Z
Uptime: 2h 15m

✅ System
─────────
Node.js: v20.10.0
Bun: 1.1.0
Platform: darwin (arm64)
Memory: 285 MB / 512 MB (55%)

✅ Configuration
────────────────
Config file: ~/.openclaude/config.json
Profile: default
Models loaded: 8
Providers configured: 3 (anthropic, openai, local)

⚠️  Provider Health
───────────────────
Anthropic: 2/3 keys active (1 throttled)
  Last sync: 2m ago
  Quota cache: 2 entries (fresh)
  
OpenAI: 1/2 keys active (1 exhausted)
  Last sync: 8m ago
  Quota cache: 1 entry (5m old - will refresh)

Local: Ready (llama.cpp via /opt/llama)
  Model: llama2-7b-q4
  Response: 45ms avg

✅ Storage
──────────
Database: /home/.openclaude/db.sqlite3 (4.2 MB)
Cache: /home/.openclaude/cache/ (128 MB)
Logs: /home/.openclaude/logs/ (2 days, 15 MB)

✅ Network
──────────
DNS: OK (8.8.8.8 reachable)
Anthropic API: OK (response: 234ms)
OpenAI API: ⚠️  Slow (response: 1042ms)

⚠️  Recommendations
────────────────────
1. OpenAI throttled - consider increasing quota or switching to Anthropic
2. Cache older than 5 min - will refresh on next request
3. Clean old logs: bun run doctor:cleanup-logs --days=7

Health Score: 8/10 (Good)
```

**When to use:**
- Before automated tasks (verify health)
- Troubleshooting slow responses
- System audits
- Before production deployments

### `doctor:config`
Validate configuration files without running.

```bash
bun run doctor:config [--strict]
```

**Output:**
```
Configuration Validation
========================

~/.openclaude/config.json
✅ Valid JSON
✅ All required fields present
✅ Provider credentials found (3)
✅ No deprecated settings

~/.openclaude/profiles/
✅ Default profile loaded
✅ Custom profile: development
✅ Custom profile: testing

Model Validation
================
✅ anthropic/claude-3-sonnet: Ready
✅ anthropic/claude-3-haiku: Ready
✅ openai/gpt-4-turbo: Ready
⚠️  openai/gpt-4: Deprecated (use gpt-4-turbo)
✅ local/llama2-7b: Ready

No errors found.
```

**When to use:**
- After editing config files
- Before git commits
- Integration testing

### `doctor:dependencies`
Check installed dependencies and versions.

```bash
bun run doctor:dependencies [--outdated] [--security]
```

**Output:**
```
Dependency Audit
================

Direct Dependencies (8)
✅ typescript@5.2.0
✅ esbuild@0.19.0
✅ zod@3.22.0
✅ better-sqlite3@9.0.0

Dev Dependencies (12)
✅ vitest@0.34.0
✅ @types/node@20.0.0

Transitive (142 total)
✅ All pinned, no floating versions

Security Audit
==============
✅ No known vulnerabilities
✅ npm audit: OK

Outdated Packages
=================
⚠️  typescript 5.2.0 → 5.3.0 available
⚠️  esbuild 0.19.0 → 0.19.1 available
```

**When to use:**
- Weekly dependency checks
- Before releases
- Security audits

### `doctor:database`
Check SQLite database integrity.

```bash
bun run doctor:database [--repair]
```

**Output:**
```
Database Health
===============
Path: /home/.openclaude/db.sqlite3
Size: 4.2 MB
Integrity: ✅ OK
PRAGMA integrity_check: OK

Tables
======
api_keys: 12 rows
call_logs: 1,284 rows
cost_entries: 892 rows
model_profiles: 8 rows

Indexes
=======
✅ api_keys_provider_id: OK
✅ call_logs_created_at: OK
✅ cost_entries_month: OK

Disk Usage
==========
Tables: 3.2 MB
Indexes: 0.8 MB
Free space: 10 MB

Recommendations
===============
✅ Good - no maintenance needed
```

**When to use:**
- After system crashes
- Diagnosis of slow queries
- Monthly maintenance

### `doctor:logs`
Analyze recent logs for errors and patterns.

```bash
bun run doctor:logs [--level=ERROR] [--tail=100]
```

**Output:**
```
Recent Logs Summary
===================
File: /home/.openclaude/logs/2026-04-29.log

Total entries: 1,284
By level:
  INFO: 1,102 (86%)
  WARN: 142 (11%)
  ERROR: 40 (3%)

Recent Errors
=============
[2026-04-29 14:28:15] ERROR [KeyRotator] No available keys for anthropic
  Context: All 3 keys locked/exhausted
  Frequency: 2 times in last hour
  Action: Check provider:status

[2026-04-29 14:10:22] WARN [DegradationRegistry] Degradation activated
  Reason: Provider API overloaded
  Duration: 5 minutes
  Action: Normal - expected during peak hours

No critical errors in last 24h ✅
```

**When to use:**
- Troubleshooting after errors
- Performance analysis
- Incident review

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Non-fatal warnings |
| 2 | Fatal errors detected |
| 3 | Configuration error |

## Related Commands

- [`provider:status`](provider.md) — Provider health details
- [`provider:logs`](provider.md) — Provider-specific logs
- [`benchmark:providers`](benchmark.md) — Performance testing
