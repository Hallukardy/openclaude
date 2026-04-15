/**
 * KeyPoolManager — manages multiple API keys per provider profile.
 *
 * When a provider returns 429 (quota exceeded / rate limit), the caller
 * rotates to the next available key automatically. The pool is initialized
 * from the active profile's apiKey + apiKeys fields.
 *
 * Usage:
 *   keyPoolManager.initPool(profile.id, profile.apiKey, profile.apiKeys)
 *   // on 429:
 *   const nextKey = keyPoolManager.rotateKey(profileId)
 *   if (nextKey) { /* update Authorization header and retry *\/ }
 */

type KeyPool = {
  keys: string[]
  currentIndex: number
}

class KeyPoolManager {
  private pools: Map<string, KeyPool> = new Map()

  /**
   * Initialize the pool for a profile.
   * Merges apiKey (primary) + apiKeys (extras) into one ordered list,
   * deduplicating while preserving insertion order.
   */
  initPool(
    profileId: string,
    apiKey: string | undefined,
    apiKeys: string[] | undefined,
  ): void {
    const allKeys = [
      ...(apiKey ? [apiKey] : []),
      ...(apiKeys ?? []),
    ]
      .map(k => k.trim())
      .filter(Boolean)

    const unique = [...new Set(allKeys)]

    if (unique.length === 0) {
      this.pools.delete(profileId)
      return
    }

    this.pools.set(profileId, { keys: unique, currentIndex: 0 })
  }

  /** Returns the current active key for the profile, or undefined. */
  getCurrentKey(profileId: string): string | undefined {
    const pool = this.pools.get(profileId)
    if (!pool || pool.keys.length === 0) return undefined
    return pool.keys[pool.currentIndex]
  }

  /** Returns the total number of keys registered for the profile. */
  getPoolSize(profileId: string): number {
    return this.pools.get(profileId)?.keys.length ?? 0
  }

  /**
   * Rotates to the next key in the pool.
   *
   * Returns the next key string if one is available, or undefined when all
   * keys have been exhausted. After exhaustion the index wraps to 0 so the
   * pool is ready for the next session.
   *
   * Side-effect: updates process.env.OPENAI_API_KEY (and ANTHROPIC_API_KEY
   * for Anthropic profiles) so that the rest of the app picks up the change.
   */
  rotateKey(profileId: string): string | undefined {
    const pool = this.pools.get(profileId)
    if (!pool || pool.keys.length <= 1) return undefined

    const nextIndex = pool.currentIndex + 1

    if (nextIndex >= pool.keys.length) {
      // All keys exhausted — reset for next session, signal failure
      pool.currentIndex = 0
      return undefined
    }

    pool.currentIndex = nextIndex
    const nextKey = pool.keys[nextIndex]!

    // Keep process.env in sync so other subsystems see the rotated key
    if (process.env.OPENAI_API_KEY !== undefined) {
      process.env.OPENAI_API_KEY = nextKey
    }
    if (process.env.ANTHROPIC_API_KEY !== undefined) {
      process.env.ANTHROPIC_API_KEY = nextKey
    }

    return nextKey
  }

  /** Reset a pool's index to 0 (call on new session or profile switch). */
  resetPool(profileId: string): void {
    const pool = this.pools.get(profileId)
    if (pool) pool.currentIndex = 0
  }

  /** Remove all pools (call when switching profiles). */
  clearAll(): void {
    this.pools.clear()
  }
}

export const keyPoolManager = new KeyPoolManager()
