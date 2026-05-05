# OpenClaude Command Registry

Comprehensive registry of all CLI commands and utilities. Inspired by OpenCode's `.opencode/command/` pattern.

## Structure

Each command has its own `.md` file documenting:
- **Purpose:** What the command does
- **Usage:** Exact invocation syntax
- **Examples:** Common scenarios
- **Output:** What to expect
- **When to use:** Context and frequency

## Commands

| Command | Purpose | Frequency |
|---------|---------|-----------|
| [`provider`](provider.md) | Manage API keys, quotas, fallback chains | Daily |
| [`doctor`](doctor.md) | Diagnose runtime state, configuration, connectivity | On troubleshoot |
| [`benchmark`](benchmark.md) | Performance test providers, compare latency/cost | Weekly |
| [`release`](release.md) | Release automation, changelog, versioning | Per release |

## Quick Start

```bash
# Check provider health
bun run provider:status

# View quota cache
bun run provider:quota

# Run diagnostics
bun run doctor:runtime

# Performance benchmark
bun run benchmark:providers

# Release checklist
bun run release:checklist
```

## Guidelines

- **Design gates:** New commands require design review (see [CONTRIBUTING.md](../../CONTRIBUTING.md))
- **Documentation:** Every command must have examples + edge cases
- **Testing:** Commands should be testable, not just interactive
- **Naming:** Use `category:action` format (provider:quota, doctor:runtime)

## Adding New Commands

1. Create `{name}.md` with purpose, usage, examples
2. Implement handler in appropriate module
3. Update this README with new entry
4. Add test cases
5. Document in PLAYBOOK.md

See [OpenCode's pattern](https://github.com/getshitdone/opencode/.opencode/command/) for examples.
