// Degradation Strategy — Progressive service degradation for graceful failures

import { DegradationLevel } from './types.js';
import type { DegradationStatus } from './types.js';

class DegradationRegistry {
  private status: DegradationStatus | null = null;
  private featureStatuses = new Map<string, boolean>(); // feature -> enabled

  setDegradation(level: DegradationLevel, reason: string, durationMs?: number): void {
    this.status = {
      level,
      reason,
      createdAt: new Date(),
      expiresAt: durationMs ? new Date(Date.now() + durationMs) : undefined,
      affectedFeatures: this.getAffectedFeatures(level),
    };

    console.log(
      `[Degradation] Level ${DegradationLevel[level]} activated: ${reason} ${durationMs ? `(expires in ${Math.round(durationMs / 1000)}s)` : ''}`
    );
  }

  clearDegradation(): void {
    if (this.status) {
      console.log(`[Degradation] Cleared (was level ${DegradationLevel[this.status.level]})`);
      this.status = null;
    }
  }

  getCurrentLevel(): DegradationLevel {
    if (!this.status) return DegradationLevel.FULL;

    // Check if degradation expired
    if (this.status.expiresAt && this.status.expiresAt.getTime() < Date.now()) {
      this.clearDegradation();
      return DegradationLevel.FULL;
    }

    return this.status.level;
  }

  getStatus(): DegradationStatus | null {
    const level = this.getCurrentLevel();
    if (level === DegradationLevel.FULL) return null;
    return this.status;
  }

  private getAffectedFeatures(level: DegradationLevel): string[] {
    const features: Record<DegradationLevel, string[]> = {
      [DegradationLevel.FULL]: [],
      [DegradationLevel.REDUCED]: ['model_switching', 'advanced_fallback'],
      [DegradationLevel.MINIMAL]: ['model_switching', 'advanced_fallback', 'key_rotation'],
      [DegradationLevel.SAFE_DEFAULT]: [
        'model_switching',
        'advanced_fallback',
        'key_rotation',
        'quota_sync',
        'cost_tracking',
      ],
    };
    return features[level];
  }

  async withDegradation<T>(
    operation: () => Promise<T>,
    fallback: T,
    operationName?: string
  ): Promise<T> {
    const level = this.getCurrentLevel();

    try {
      // Skip operation entirely if degraded below threshold
      if (level >= DegradationLevel.MINIMAL) {
        if (operationName) {
          console.log(`[Degradation] Skipping ${operationName} (level ${DegradationLevel[level]})`);
        }
        return fallback;
      }

      return await operation();
    } catch (err) {
      // Use fallback on error if degraded
      if (level >= DegradationLevel.REDUCED) {
        console.warn(`[Degradation] Operation failed, using fallback (level ${DegradationLevel[level]})`, err);
        return fallback;
      }

      throw err;
    }
  }

  withDegradationSync<T>(
    operation: () => T,
    fallback: T,
    operationName?: string
  ): T {
    const level = this.getCurrentLevel();

    try {
      if (level >= DegradationLevel.MINIMAL) {
        if (operationName) {
          console.log(`[Degradation] Skipping ${operationName} (level ${DegradationLevel[level]})`);
        }
        return fallback;
      }

      return operation();
    } catch (err) {
      if (level >= DegradationLevel.REDUCED) {
        console.warn(`[Degradation] Operation failed, using fallback (level ${DegradationLevel[level]})`, err);
        return fallback;
      }

      throw err;
    }
  }

  isFeatureEnabled(featureName: string): boolean {
    const level = this.getCurrentLevel();
    const affectedFeatures = this.getAffectedFeatures(level);
    return !affectedFeatures.includes(featureName);
  }

  getDegradationReport() {
    const status = this.getStatus();
    return {
      isDegraded: status !== null,
      level: this.getCurrentLevel(),
      status,
      timestamp: new Date(),
    };
  }
}

const degradationRegistry = new DegradationRegistry();

export { degradationRegistry, DegradationRegistry, DegradationLevel };
