// Quota Cache — Smart quota tracking with 5-min TTL (reduces API calls by ~90%)

import type { QuotaEntry } from './types.js';

class QuotaCache {
  private cache = new Map<string, QuotaEntry>();
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

  set(keyId: string, remaining: number, tier?: string): void {
    this.cache.set(keyId, {
      keyId,
      remaining,
      lastSyncedAt: new Date(),
      ttlMs: this.DEFAULT_TTL_MS,
      tier,
    });
  }

  get(keyId: string): number | null {
    const entry = this.cache.get(keyId);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.lastSyncedAt.getTime() > entry.ttlMs) {
      this.cache.delete(keyId);
      return null;
    }

    return entry.remaining;
  }

  isExpired(keyId: string): boolean {
    const entry = this.cache.get(keyId);
    if (!entry) return true;
    return Date.now() - entry.lastSyncedAt.getTime() > entry.ttlMs;
  }

  invalidate(keyId: string): void {
    this.cache.delete(keyId);
  }

  invalidateByTier(tier: string): void {
    const idsToDelete: string[] = [];
    for (const [keyId, entry] of this.cache.entries()) {
      if (entry.tier === tier) {
        idsToDelete.push(keyId);
      }
    }
    idsToDelete.forEach(id => this.cache.delete(id));
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { cacheSize: number; entries: QuotaEntry[] } {
    return {
      cacheSize: this.cache.size,
      entries: Array.from(this.cache.values()),
    };
  }
}

const quotaCache = new QuotaCache();

export { quotaCache, QuotaCache };
