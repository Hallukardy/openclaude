// Provider Management — Shared types for orchestration, quota, budget, and degradation

export type RoutingStrategy =
  | 'priority'
  | 'round-robin'
  | 'fill-first'
  | 'least-used'
  | 'weighted'
  | 'cost-optimized';

export type KeyStatus = 'active' | 'throttled' | 'exhausted' | 'disabled' | 'invalid';
export type KeyType = 'free' | 'paid' | 'replenishable';
export type ResetInterval = 'rpm' | 'rpd' | 'rpm_rpd' | 'monthly' | null;

export interface ApiKey {
  id: string;
  provider_id: string;
  label: string;
  api_key: string;
  status: KeyStatus;
  key_type: KeyType;
  priority: number;
  daily_limit: number;
  current_usage: number;
  reset_at: number | null;
  reset_interval: ResetInterval;
  cooldown_until: number | null;
  last_used_at: number | null;
  refresh_token: string | null;
  access_token: string | null;
  access_token_expires: number | null;
  account_id: string | null;
}

export interface ComboModel {
  model_id: string;
  weight: number;
  position: number;
}

export interface Combo {
  id: string;
  name: string;
  tier: string;
  strategy: RoutingStrategy;
  models: ComboModel[];
}

export interface QuotaEntry {
  keyId: string;
  remaining: number;
  lastSyncedAt: Date;
  ttlMs: number;
  tier?: string;
}

export interface BudgetConfig {
  keyId: string;
  monthlyLimitUsd: number;
  alertThresholdPercent: number;
  monthlySpentUsd: number;
  resetDate: Date;
  isExhausted: boolean;
}

export interface CostEntry {
  keyId: string;
  providerId: string;
  modelId: string;
  costUsd: number;
  tokensUsed: number;
  timestamp: Date;
}

export interface CostAlert {
  type: 'threshold' | 'exhausted';
  keyId: string;
  spent: number;
  limit: number;
  percentUsed: number;
  timestamp: Date;
}

export interface LockoutRecord {
  keyId: string;
  failureCount: number;
  windowStart: Date;
  lockedUntil?: Date;
  escalationLevel: number;
  lastFailureReason?: string;
}

export enum DegradationLevel {
  FULL = 0,
  REDUCED = 1,
  MINIMAL = 2,
  SAFE_DEFAULT = 3,
}

export interface DegradationStatus {
  level: DegradationLevel;
  affectedFeatures: string[];
  reason: string;
  createdAt: Date;
  expiresAt?: Date;
}
