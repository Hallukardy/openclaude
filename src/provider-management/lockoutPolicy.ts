// Lockout Policy — Auto-lockout failed API keys with escalating durations

import type { LockoutRecord } from './types.js';

const LOCKOUT_CONFIG = {
  FAILURE_THRESHOLD: 3, // Failures before lockout
  WINDOW_MS: 5 * 60 * 1000, // 5 minutes window for counting
  BASE_DURATION_MS: 15 * 60 * 1000, // 15 minutes initial lockout
  ESCALATION_MULTIPLIER: 1.5, // 1.5x longer each time
  MAX_DURATION_MS: 24 * 60 * 60 * 1000, // 24 hour max
};

class LockoutRegistry {
  private records = new Map<string, LockoutRecord>();

  checkLockout(keyId: string): { locked: boolean; remainingMs?: number } {
    const record = this.records.get(keyId);
    if (!record?.lockedUntil) {
      return { locked: false };
    }

    const remaining = record.lockedUntil.getTime() - Date.now();
    if (remaining > 0) {
      return { locked: true, remainingMs: remaining };
    }

    // Lockout expired, clean up
    this.records.delete(keyId);
    return { locked: false };
  }

  recordFailedAttempt(keyId: string, reason?: string): void {
    let record = this.records.get(keyId);

    if (!record) {
      record = {
        keyId,
        failureCount: 0,
        windowStart: new Date(),
        escalationLevel: 0,
      };
    }

    // Reset window if expired
    if (Date.now() - record.windowStart.getTime() > LOCKOUT_CONFIG.WINDOW_MS) {
      record.failureCount = 1;
      record.windowStart = new Date();
    } else {
      record.failureCount++;
    }

    record.lastFailureReason = reason;

    // Trigger lockout if threshold reached
    if (record.failureCount >= LOCKOUT_CONFIG.FAILURE_THRESHOLD) {
      const baseDuration = LOCKOUT_CONFIG.BASE_DURATION_MS;
      const escalatedDuration = baseDuration * Math.pow(LOCKOUT_CONFIG.ESCALATION_MULTIPLIER, record.escalationLevel);
      const finalDuration = Math.min(escalatedDuration, LOCKOUT_CONFIG.MAX_DURATION_MS);

      record.lockedUntil = new Date(Date.now() + finalDuration);
      record.escalationLevel++;

      console.log(
        `[Lockout] Key ${keyId} locked for ${Math.round(finalDuration / 1000)}s (escalation level ${record.escalationLevel}). Reason: ${reason || 'unknown'}`
      );
    }

    this.records.set(keyId, record);
  }

  recordSuccess(keyId: string): void {
    const record = this.records.get(keyId);
    if (record) {
      // Reset failure counter on success
      record.failureCount = 0;
      record.windowStart = new Date();
    }
  }

  forceUnlock(keyId: string): void {
    const record = this.records.get(keyId);
    if (record) {
      record.lockedUntil = undefined;
      record.failureCount = 0;
      record.escalationLevel = 0;
      console.log(`[Lockout] Key ${keyId} manually unlocked`);
    }
  }

  getLockedIdentifiers(): string[] {
    const locked: string[] = [];
    for (const [keyId, record] of this.records.entries()) {
      if (record.lockedUntil && record.lockedUntil.getTime() > Date.now()) {
        locked.push(keyId);
      }
    }
    return locked;
  }

  getStatus(keyId: string): LockoutRecord | null {
    return this.records.get(keyId) || null;
  }

  getAllRecords(): LockoutRecord[] {
    return Array.from(this.records.values());
  }
}

const lockoutRegistry = new LockoutRegistry();

export { lockoutRegistry, LockoutRegistry, LOCKOUT_CONFIG };
