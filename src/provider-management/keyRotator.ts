// Key Rotator — Smart API key selection with quota tracking and health checks

import type { ApiKey, RoutingStrategy } from './types.js';
import { quotaCache } from './quotaCache.js';

/**
 * Selects the best available API key for a given provider.
 * Prioritization:
 * 1. Health: status = 'active' OR (status = 'throttled' AND cooldown_until < now)
 * 2. Quota: Check quota cache (5min TTL) before using key
 * 3. Cost: key_type = 'free' > 'replenishable' > 'paid'
 * 4. Manual: priority (lower = better)
 */
export function selectKey(
  keys: ApiKey[],
  strategy: RoutingStrategy = 'priority',
  excludeIds: Set<string> = new Set(),
  tier?: 'free' | 'paid' | 'eco' | 'pro' | 'any'
): ApiKey | null {
  const now = Math.floor(Date.now() / 1000);

  // Normalize tier
  const normalizedTier = tier === 'eco' ? 'free' : tier === 'pro' ? 'paid' : tier;

  // Filter: only active or unthrottled keys
  const healthyKeys = keys.filter(k => {
    if (excludeIds.has(k.id)) return false;
    if (k.status === 'active') return true;
    if (k.status === 'throttled' && k.cooldown_until && k.cooldown_until <= now) return true;
    return false;
  });

  // Filter by tier
  let filteredKeys = healthyKeys;
  if (normalizedTier === 'free') {
    filteredKeys = healthyKeys.filter(k => k.key_type === 'free' || k.key_type === 'replenishable');
  } else if (normalizedTier === 'paid') {
    filteredKeys = healthyKeys.filter(k => k.key_type === 'paid');
  }

  // Filter by quota
  const availableKeys = filteredKeys.filter(k => {
    const cachedQuota = quotaCache.get(k.id);
    if (cachedQuota !== null && cachedQuota <= 0) return false;
    return true;
  });

  if (availableKeys.length === 0) return null;

  // Sort by priority: cost type → priority → last_used_at
  availableKeys.sort((a, b) => {
    const costOrder = { free: 0, replenishable: 1, paid: 2 };
    const costDiff = (costOrder[a.key_type] ?? 3) - (costOrder[b.key_type] ?? 3);
    if (costDiff !== 0) return costDiff;
    if (a.priority !== b.priority) return a.priority - b.priority;
    const aUsed = a.last_used_at ?? 0;
    const bUsed = b.last_used_at ?? 0;
    return aUsed - bUsed;
  });

  if (strategy === 'least-used') {
    return availableKeys.reduce((min, k) => (k.current_usage < min.current_usage ? k : min));
  }

  return availableKeys[0];
}

/**
 * Mark a key as throttled with optional Retry-After header parsing
 */
export function markKeyRateLimited(key: ApiKey, retryAfterHeader?: string): ApiKey {
  let cooldownUntil: number;

  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) {
      cooldownUntil = Math.floor(Date.now() / 1000) + seconds;
    } else {
      const ts = Date.parse(retryAfterHeader);
      cooldownUntil = !isNaN(ts) ? Math.floor(ts / 1000) : Math.floor(Date.now() / 1000) + 300;
    }
  } else {
    cooldownUntil = Math.floor(Date.now() / 1000) + 300;
  }

  return {
    ...key,
    status: 'throttled',
    cooldown_until: cooldownUntil,
  };
}

/**
 * Mark key as exhausted (or set replenishable cooldown)
 */
export function markKeyExhausted(key: ApiKey): ApiKey {
  if (key.key_type === 'replenishable') {
    const now = Math.floor(Date.now() / 1000);
    let cooldownUntil = now + 3600; // default 1h
    if (key.reset_interval === 'rpm') cooldownUntil = now + 60;
    else if (key.reset_interval === 'rpd' || key.reset_interval === 'rpm_rpd') cooldownUntil = now + 86400;

    return {
      ...key,
      status: 'throttled',
      cooldown_until: cooldownUntil,
    };
  }

  return {
    ...key,
    status: 'exhausted',
  };
}

/**
 * Mark key as invalid (permanently disabled)
 */
export function markKeyInvalid(key: ApiKey): ApiKey {
  return {
    ...key,
    status: 'invalid',
  };
}

/**
 * Record token usage for a key
 */
export function recordKeyUsage(key: ApiKey, tokensUsed: number): ApiKey {
  return {
    ...key,
    current_usage: key.current_usage + tokensUsed,
    last_used_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * Restore throttled keys whose cooldown expired
 */
export function restoreExpiredKeys(keys: ApiKey[]): ApiKey[] {
  const now = Math.floor(Date.now() / 1000);
  return keys.map(k => {
    if (k.status === 'throttled' && k.cooldown_until && k.cooldown_until <= now) {
      return {
        ...k,
        status: 'active',
        cooldown_until: null,
      };
    }
    return k;
  });
}

/**
 * Update quota cache for a key after provider check
 */
export function updateQuotaCache(keyId: string, remaining: number, tier?: string): void {
  quotaCache.set(keyId, remaining, tier);
}

/**
 * Invalidate quota cache
 */
export function invalidateQuotaCache(keyId: string): void {
  quotaCache.invalidate(keyId);
}

export { quotaCache };
