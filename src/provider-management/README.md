# Provider Management

Orchestration layer for multi-provider LLM support with quota caching, budget tracking, auto-lockout, and graceful degradation.

## Modules

### QuotaCache
Smart quota tracking with 5-minute TTL (reduces provider API polling by ~90%).

```typescript
import { quotaCache, updateQuotaCache } from './index.js';

// Update quota after checking with provider
updateQuotaCache('key-123', remaining: 1500, tier: 'free');

// Query cached quota (returns null if expired)
const remaining = quotaCache.get('key-123');

// Invalidate on error
quotaCache.invalidate('key-123');
```

### LockoutPolicy
Auto-lockout failed API keys with escalating durations:
- 3 failures in 5 minutes → 15 min lockout
- Next failure → 22.5 min lockout (1.5x)
- Continues until 24 hour max

```typescript
import { lockoutRegistry } from './index.js';

// Record failure
lockoutRegistry.recordFailedAttempt('key-123', 'rate limit');

// Check if locked
const { locked, remainingMs } = lockoutRegistry.checkLockout('key-123');

// Reset on success
lockoutRegistry.recordSuccess('key-123');

// Manual unlock
lockoutRegistry.forceUnlock('key-123');

// Get all locked keys
const lockedIds = lockoutRegistry.getLockedIdentifiers();
```

### CostRules
Monthly budget tracking per API key with threshold alerts.

```typescript
import { costRulesEngine } from './index.js';

// Register budget
costRulesEngine.registerBudget({
  keyId: 'key-123',
  monthlyLimitUsd: 50,
  alertThresholdPercent: 80,
  monthlySpentUsd: 0,
  resetDate: new Date(),
  isExhausted: false,
});

// Record usage
costRulesEngine.recordCost({
  keyId: 'key-123',
  providerId: 'anthropic',
  modelId: 'claude-3-sonnet',
  costUsd: 0.42,
  tokensUsed: 2100,
  timestamp: new Date(),
});

// Get summary
const summary = costRulesEngine.getMonthlySummary('key-123');
// { spent: 0.42, limit: 50, percentUsed: 0.84, ... }

// Listen for alerts
costRulesEngine.onAlert(alert => {
  console.log(`Cost alert: ${alert.type} on ${alert.keyId}`);
});
```

### DegradationStrategy
Progressive service degradation for graceful failures. Levels:
- **FULL** (0): All features enabled
- **REDUCED** (1): Limited models/features
- **MINIMAL** (2): Only essentials + cache
- **SAFE_DEFAULT** (3): Hardcoded fallback only

```typescript
import { degradationRegistry, DegradationLevel } from './index.js';

// Activate degradation
degradationRegistry.setDegradation(
  DegradationLevel.REDUCED,
  'Provider API overloaded',
  60000 // 1 minute duration
);

// Use with fallback
const result = await degradationRegistry.withDegradation(
  () => expensiveOperation(),
  fallbackValue,
  'expensiveOperation'
);

// Check status
const report = degradationRegistry.getDegradationReport();
```

### KeyRotator
Smart key selection with health checks, quota filtering, and cost prioritization.

```typescript
import { selectKey, markKeyRateLimited, recordKeyUsage } from './index.js';

const keys = await getKeysForProvider('anthropic');

// Select best available key (priority, cost, quota-aware)
const selected = selectKey(keys, 'priority', excludeIds, 'free');

// Mark as throttled (Retry-After aware)
const throttled = markKeyRateLimited(selected, retryAfterHeader);

// Record usage
const updated = recordKeyUsage(selected, tokensUsed);

// Restore keys on next cycle
const restored = restoreExpiredKeys(keys);
```

## Integration Example

```typescript
import {
  selectKey,
  recordKeyUsage,
  markKeyRateLimited,
  costRulesEngine,
  lockoutRegistry,
  degradationRegistry,
  DegradationLevel,
} from '@openclaude/provider-management';

async function callProvider(provider: string, model: string) {
  // 1. Check degradation
  const degraded = degradationRegistry.getStatus();
  if (degraded?.level === DegradationLevel.SAFE_DEFAULT) {
    return fallbackModel(); // Hardcoded safe response
  }

  // 2. Select key (quota-aware)
  const keys = await getKeysForProvider(provider);
  const key = selectKey(keys);
  if (!key) throw new Error('No available keys');

  // 3. Check lockout
  const { locked } = lockoutRegistry.checkLockout(key.id);
  if (locked) throw new Error('Key locked');

  try {
    // 4. Call provider
    const response = await provider.complete(key, model, prompt);

    // 5. Update quota cache
    updateQuotaCache(key.id, response.remaining_quota);

    // 6. Record usage & cost
    recordKeyUsage(key, response.usage.total_tokens);
    costRulesEngine.recordCost({
      keyId: key.id,
      providerId: provider,
      modelId: model,
      costUsd: computeCost(response),
      tokensUsed: response.usage.total_tokens,
      timestamp: new Date(),
    });

    // 7. Reset lockout on success
    lockoutRegistry.recordSuccess(key.id);

    return response;
  } catch (error) {
    // 8. Handle failures
    if (error.code === 'RATE_LIMIT') {
      markKeyRateLimited(key, error.retryAfter);
      lockoutRegistry.recordFailedAttempt(key.id, 'rate limit');
    } else if (error.code === 'INVALID_KEY') {
      markKeyInvalid(key);
    }
    throw error;
  }
}
```

## Testing

```bash
bun test src/provider-management/__tests__/
```

Key test scenarios:
- QuotaCache TTL expiry
- LockoutPolicy escalation timing
- CostRules budget overflow + alerts
- DegradationStrategy feature disabling
- KeyRotator priority sorting + quota filtering
