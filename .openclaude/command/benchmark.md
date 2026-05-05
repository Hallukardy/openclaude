# Command: benchmark

**Category:** Performance Testing  
**Frequency:** Weekly  
**Requires:** Provider keys configured

## Purpose

Compare provider performance (latency, cost, quality) with representative workloads. Identifies fastest/cheapest options.

## Commands

### `benchmark:providers`
Comprehensive provider performance comparison.

```bash
bun run benchmark:providers [--duration=60] [--concurrent=5] [--prompt=TEMPLATE]
```

**Examples:**
```bash
# Default 60-second benchmark
bun run benchmark:providers

# Extended benchmark, 10 concurrent requests
bun run benchmark:providers --duration=120 --concurrent=10

# Custom prompt template
bun run benchmark:providers --prompt=reasoning

# Quick 30-second test
bun run benchmark:providers --duration=30
```

**Output:**
```
Provider Performance Benchmark
==============================
Duration: 60s | Concurrency: 5 | Requests: 142

Latency (p50/p95/p99)
═════════════════════════════════════════════
Anthropic Claude 3 Sonnet:
  Time-to-first-token: 285ms / 450ms / 680ms
  Total latency: 1200ms / 1450ms / 2100ms
  Throughput: 2.4 req/s

OpenAI GPT-4 Turbo:
  Time-to-first-token: 320ms / 520ms / 900ms
  Total latency: 1850ms / 2200ms / 3100ms
  Throughput: 1.5 req/s

Local Llama 2 7B:
  Time-to-first-token: 45ms / 60ms / 80ms
  Total latency: 950ms / 1100ms / 1300ms
  Throughput: 1.0 req/s

Cost per 1K tokens
══════════════════
Anthropic: $0.003 input / $0.009 output
OpenAI: $0.015 input / $0.030 output
Local: $0.000 (self-hosted)

Quality (BLEU score on task set)
════════════════════════════════
Anthropic: 0.92 ⭐ Best
OpenAI: 0.94 ⭐⭐ Highest
Local: 0.78

Recommendation
══════════════
✅ Best overall: OpenAI (highest quality)
💰 Best value: Anthropic (cost-effective, high quality)
⚡ Fastest: Local (self-hosted, lowest latency)
```

**When to use:**
- Weekly performance tracking
- Before large campaigns
- Comparing new models/providers
- Cost optimization reviews

### `benchmark:models`
Compare specific models within a provider.

```bash
bun run benchmark:models --provider=anthropic [--models=LIST]
```

**Examples:**
```bash
# All Anthropic models
bun run benchmark:models --provider=anthropic

# Specific models
bun run benchmark:models --provider=anthropic --models=sonnet,haiku
```

**Output:**
```
Anthropic Model Comparison
==========================
Test set: 50 diverse prompts

Claude 3 Opus
  Latency: 850ms avg
  Cost: $0.015 input / $0.075 output
  Quality: 0.96
  Use case: Complex reasoning, analysis

Claude 3 Sonnet
  Latency: 280ms avg ⚡ Fastest
  Cost: $0.003 input / $0.009 output 💰 Cheapest
  Quality: 0.92
  Use case: General purpose, balance

Claude 3 Haiku
  Latency: 200ms avg
  Cost: $0.00025 input / $0.00125 output
  Quality: 0.85
  Use case: Simple tasks, high throughput
```

### `benchmark:fallback`
Test fallback chain performance under simulated failures.

```bash
bun run benchmark:fallback --failure-rate=0.2 [--duration=60]
```

**Output:**
```
Fallback Chain Resilience Test
==============================
Simulated failure rate: 20%

Chain: anthropic → openai → local fallback

Requests: 250
✅ Successful: 200 (80%)
🔄 Fallback used: 50 (20%)
  → Anthropic failed: 30
  → OpenAI failed: 10
  → Recovered from local: 10 (recovery rate: 100%)

Latency impact
==============
Normal path: 280ms avg
Fallback path: 750ms avg (2.7x slower)
Recovery time: 85ms (detection + routing)

Availability: 100% (all requests completed)
Quality: 0.88 (fallback models slightly lower)

Recommendation
==============
✅ Fallback chain is effective
⚠️  Monitor latency spike when primary fails
```

**When to use:**
- Validate fallback chains work
- Understand performance under failures
- SLA planning

### `benchmark:cost-analysis`
Detailed cost breakdown for a workload.

```bash
bun run benchmark:cost-analysis --workload=NAME [--quantity=1000]
```

**Examples:**
```bash
# Sample 1000 requests per model
bun run benchmark:cost-analysis --workload=customer-service

# Larger sample
bun run benchmark:cost-analysis --workload=content-generation --quantity=10000
```

**Output:**
```
Cost Analysis: Customer Service Workload
=========================================
Sample size: 1,000 requests | Avg tokens: 450 input, 150 output

Cost per Request
════════════════
Anthropic Sonnet: $0.0036 input + $0.0014 output = $0.0050 total
OpenAI GPT-4: $0.015 input + $0.030 output = $0.045 total ❌ 9x more
Local Llama: $0.0000 (self-hosted)

Monthly Projection (10K requests)
═════════════════════════════════
Anthropic: $50.00 (fastest growth)
OpenAI: $450.00 (budget constraint likely)
Local: $0.00 (requires infrastructure)

Break-even analysis
═══════════════════
Anthropic vs OpenAI: Break even at ~12K requests/month
Local setup cost ($500 infra): Break even at 1M tokens/month

Recommendation
══════════════
💰 Use Anthropic for cost-sensitive workloads
⭐ Use OpenAI only when quality is critical
🏠 Consider self-hosted for high-volume
```

## Best Practices

- Run benchmarks during off-peak hours
- Use same prompt template for fair comparison
- Account for token-counting variations
- Monitor real-world performance vs benchmarks
- Re-benchmark monthly (models improve)

## Related Commands

- [`provider:status`](provider.md) — Current health
- [`provider:costs`](provider.md) — Budget tracking
- [`doctor:runtime`](doctor.md) — System diagnostics
