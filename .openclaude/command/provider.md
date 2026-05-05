# Command: provider

**Category:** Provider Management  
**Frequency:** Daily  
**Requires:** Provider keys configured

## Purpose

View and manage API key health, quotas, budgets, and fallback chains. Diagnose provider issues without restarting.

## Commands

### `provider:status`
Show summary of all provider keys and their health.

```bash
bun run provider:status
```

**Output:**
```
Provider Health Summary
=======================

Anthropic (3 keys)
  ✅ key-prod-001 (active, priority=0) - Last used 2m ago
  ⚠️  key-test-001 (throttled) - Cooldown until 14:32
  🔴 key-invalid-001 (invalid) - Marked invalid

OpenAI (2 keys)
  ✅ key-prod-002 (active, priority=0) - Last used 8s ago
  🚫 key-free-001 (exhausted) - Resets tomorrow

Budget Status
=============
Anthropic: $42.15 / $100.00 (42%) - Reset on 2026-05-01
OpenAI: $8.97 / $50.00 (18%) - Reset on 2026-05-01

Locked Keys (Auto-Lockout)
===========================
None currently locked
```

**When to use:**
- Daily health checks
- Before automating tasks (ensure keys available)
- Troubleshooting rate limits

### `provider:quota`
View quota cache and hit rate.

```bash
bun run provider:quota [--provider=NAME] [--stats]
```

**Examples:**
```bash
# All quotas
bun run provider:quota

# Single provider
bun run provider:quota --provider=anthropic

# With cache stats
bun run provider:quota --stats
```

**Output:**
```
Quota Cache (TTL: 5 min)
========================
Anthropic
  key-prod-001: 1,500 tokens remaining (cached 2m ago)
  key-prod-002: 3,200 tokens remaining (cached 18s ago)

Cache Stats
===========
Total entries: 5
Hit rate: 94.2% (942/1000 queries)
Size: 2.3 KB
```

**When to use:**
- Check remaining quota before large requests
- Diagnose quota cache hits/misses
- Verify quota sync with providers

### `provider:lock`
View and manage auto-lockout registry.

```bash
bun run provider:lock [--unlock=KEY_ID] [--reset-all]
```

**Examples:**
```bash
# View locked keys
bun run provider:lock

# Unlock specific key
bun run provider:lock --unlock=key-prod-001

# Reset all lockouts
bun run provider:lock --reset-all
```

**Output:**
```
Auto-Lockout Registry
=====================
key-test-001 (Escalation Level: 2)
  Locked until: 14:45 (in 8m 32s)
  Failures: 3
  Reason: Rate limit (429)
  Window: 5 minutes

key-invalid-001 (Escalation Level: 1)
  Locked until: 13:00 (expired - next attempt will unlock)
  Failures: 1
  Reason: Invalid API key
```

**When to use:**
- Understand why a key is unavailable
- Manual recovery after extended outage
- Verify escalation progression

### `provider:fallback`
View and test fallback chains.

```bash
bun run provider:fallback [--test] [--provider=NAME]
```

**Examples:**
```bash
# View chains
bun run provider:fallback

# Test degradation fallback
bun run provider:fallback --test --provider=anthropic
```

**Output:**
```
Fallback Chains
===============

anthropic (Primary)
  1. key-prod-001 (active, 1500 tokens)
  2. key-prod-002 (active, 3200 tokens)
  3. key-test-001 (throttled - skip)
  [SAFE_DEFAULT: GPT-3.5 via OpenAI free tier]

Test Result
===========
✅ Chain resolution OK
All keys checked, 2 available, 1 skipped
Fallback depth: 3 + safe default
```

**When to use:**
- Verify fallback order matches expectations
- Test routing without actual API calls
- Check safe-default availability

### `provider:costs`
View monthly spending and budget alerts.

```bash
bun run provider:costs [--key=ID] [--detailed]
```

**Examples:**
```bash
# Global summary
bun run provider:costs

# Per-key details
bun run provider:costs --detailed

# Single key
bun run provider:costs --key=key-prod-001
```

**Output:**
```
Monthly Budget Summary
======================
Total: $42.15 / $150.00 (28%)

By Provider
===========
Anthropic: $32.15 / $100.00 (32%) - Reset 2026-05-01
OpenAI: $10.00 / $50.00 (20%) - Reset 2026-05-01

By Model
========
claude-3-sonnet: $18.50
gpt-4-turbo: $23.65

Alerts (80% threshold)
======================
⚠️  Anthropic approaching limit (32%)
```

**When to use:**
- Budget reviews
- Optimize model selection (identify expensive models)
- Predict month-end overages

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| All keys locked | Shows safe-default fallback only |
| No quota cache | Indicates `[no cache]` - will sync with provider on next call |
| Month has reset | Shows `0 / limit` with new reset date |
| Budget exhausted | Key marked as throttled, excluded from selection |

## Related Commands

- [`doctor:runtime`](doctor.md) — Full runtime diagnostics
- [`benchmark:providers`](benchmark.md) — Performance comparison
- [`release:checklist`](release.md) — Release validation
