# Command: release

**Category:** Release Management  
**Frequency:** Per release (monthly or as needed)  
**Requires:** Main branch clean, all tests passing

## Purpose

Automated release checklist, validation, version bumping, and changelog generation. Prevents human error.

## Commands

### `release:checklist`
Interactive release validation checklist.

```bash
bun run release:checklist [--dry-run]
```

**Output:**
```
OpenClaude Release Checklist
============================
Version: 1.2.0 → 1.3.0 (minor bump)
Date: 2026-04-29

Pre-Release Checks
══════════════════
✅ Branch clean (no unstaged changes)
✅ On main branch
✅ Ahead of remote by 3 commits
✅ No merge conflicts
✅ All tests passing (892 tests in 4.2s)
✅ TypeScript strict mode: no errors
✅ ESLint: no errors
✅ Security audit: no vulnerabilities

Code Quality
════════════
✅ Coverage: 82% (target: ≥80%)
✅ No TODO comments left unresolved
✅ No console.log in production code
✅ No deprecated APIs used
✅ CHANGELOG.md updated
✅ README.md reflects new features

Documentation
══════════════
✅ All public APIs documented
✅ PLAYBOOK.md current
✅ CONTRIBUTING.md current
✅ AGENTS.md current
✅ Migration guide (if needed)

Configuration
══════════════
✅ package.json version matches tag (1.3.0)
✅ lockfile committed
✅ .npmrc correct
✅ GitHub token available

Final Approval
══════════════
Ready to release: YES ✅

Next steps:
  1. bun run release:publish --version=1.3.0
  2. Monitor deployment
  3. Post release notes on GitHub
```

**When to use:**
- Before every release
- Prevents forgotten steps
- Catches configuration issues early

### `release:changelog`
Generate changelog from commits since last release.

```bash
bun run release:changelog [--since=TAG] [--draft]
```

**Examples:**
```bash
# Latest release
bun run release:changelog

# Since specific tag
bun run release:changelog --since=v1.2.0

# Draft mode (don't commit)
bun run release:changelog --draft
```

**Output:**
```
## [1.3.0] - 2026-04-29

### Added
- `provider:quota` command for quota cache inspection (#847)
- Cost alerts system with threshold notifications (#835)
- Degradation levels FULL/REDUCED/MINIMAL/SAFE_DEFAULT (#821)
- Auto-lockout policy with escalating durations (#814)
- KeyRotator with quota-aware key selection (#802)

### Changed
- Improved latency of quota cache from 100ms to 5ms (#847)
- Updated LockoutPolicy window from 3min to 5min (#814)
- Refactored degradation strategy for clarity (#821)

### Fixed
- Fixed race condition in QuotaCache.get() (#835)
- Fixed month-reset logic in CostRules (#828)
- Fixed TypeScript strict mode errors in keyRotator (#802)

### Removed
- Removed deprecated `selectProvider()` function

### Security
- Fixed CSV injection in cost exports (#833)

### Dependencies
- Upgrade esbuild to 0.19.1
- Upgrade TypeScript to 5.3.0

---

Contributors: @user1, @user2 (2 commits each)
```

**When to use:**
- Part of release workflow
- Create release notes
- Document version changes

### `release:version`
Bump version in package.json and git tag.

```bash
bun run release:version [--major|--minor|--patch] [--pre=PREID]
```

**Examples:**
```bash
# Patch release (1.2.0 → 1.2.1)
bun run release:version --patch

# Minor release (1.2.0 → 1.3.0)
bun run release:version --minor

# Major release (1.2.0 → 2.0.0)
bun run release:version --major

# Pre-release (1.3.0-alpha.1)
bun run release:version --minor --pre=alpha
```

**Output:**
```
Version Bump
════════════
Current: 1.2.0
New: 1.3.0
Bump type: minor

Updated files:
  ✅ package.json (version field)
  ✅ package-lock.json (regenerated)

Git changes:
  ✅ Commit created: "chore: bump version to 1.3.0"
  ✅ Tag created: v1.3.0

Ready to push: git push origin main --tags
```

**When to use:**
- Automated versioning
- Part of release pipeline

### `release:publish`
Build, tag, and publish to npm + GitHub.

```bash
bun run release:publish [--version=VERSION] [--skip-build] [--skip-publish]
```

**Examples:**
```bash
# Full release
bun run release:publish --version=1.3.0

# Dry run (no actual publish)
bun run release:publish --version=1.3.0 --dry-run
```

**Output:**
```
OpenClaude Release: 1.3.0
═════════════════════════

Step 1: Build
────────────
✅ TypeScript compilation OK (8.2s)
✅ ESM bundle: 45 KB (gzipped 12 KB)
✅ CJS bundle: 52 KB (gzipped 14 KB)
✅ Dist files verified

Step 2: Tests
─────────────
✅ Unit tests: 892 passed
✅ Integration tests: 45 passed
✅ E2E tests: 12 passed

Step 3: Package & Tag
─────────────────────
✅ .npmignore validated
✅ README.md in tarball ✅
✅ License included ✅
✅ Git tag created: v1.3.0

Step 4: Publish
────────────────
✅ npm publish successful
  Tarball size: 28 KB
  Registry: npmjs.com
  URL: https://npmjs.com/package/openclaude

✅ GitHub release created
  URL: https://github.com/openclaude/openclaude/releases/tag/v1.3.0
  Assets: source code, changelog

Summary
═══════
Released: 1.3.0
Build: Success
Tests: 100% pass
Published: npm + GitHub

Post-release monitoring
═══════════════════════
Monitor in 5 minutes:
  1. npm registry for package
  2. GitHub downloads
  3. User reported issues
```

**When to use:**
- Final release step
- Automates entire publish flow

## Release Checklist Template

```markdown
# Release v1.3.0

- [ ] Tests passing
- [ ] Coverage ≥80%
- [ ] CHANGELOG.md updated
- [ ] CONTRIBUTING.md current
- [ ] No security vulnerabilities
- [ ] No deprecated APIs in use
- [ ] Version bumped (package.json)
- [ ] npm & GitHub publish successful
- [ ] Release notes posted
- [ ] Monitoring set up for 24h

Sign off: @maintainer
```

## Best Practices

- **Dry run first:** Always use `--dry-run` before real publish
- **Test in staging:** Deploy to staging environment first
- **Monitor 24h:** Watch for user issues after release
- **Keep changelog:** Update incrementally, not just at release
- **Semantic versioning:** Follow SemVer (major.minor.patch)
- **Security first:** Scan for vulnerabilities before publish

## Related Commands

- [`doctor:runtime`](doctor.md) — Pre-release health check
- [`provider:status`](provider.md) — Verify provider connectivity
- [`benchmark:providers`](benchmark.md) — Performance baseline
