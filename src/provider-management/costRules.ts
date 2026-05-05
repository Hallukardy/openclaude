// Cost Rules — Budget tracking per API key with threshold alerts

import type { BudgetConfig, CostEntry, CostAlert } from './types.js';

class CostRulesEngine {
  private budgets = new Map<string, BudgetConfig>();
  private costEntries: CostEntry[] = [];
  private alertCallbacks: ((alert: CostAlert) => void)[] = [];

  registerBudget(config: BudgetConfig): void {
    this.budgets.set(config.keyId, config);
  }

  recordCost(entry: CostEntry): void {
    this.costEntries.push(entry);

    const budget = this.budgets.get(entry.keyId);
    if (!budget) {
      return; // Budget not configured, skip tracking
    }

    // Check if month has reset
    if (this.hasMonthReset(budget.resetDate)) {
      budget.monthlySpentUsd = 0;
      budget.resetDate = this.getNextMonthStart();
      budget.isExhausted = false;
    }

    budget.monthlySpentUsd += entry.costUsd;

    const percentUsed = (budget.monthlySpentUsd / budget.monthlyLimitUsd) * 100;

    // Trigger alerts
    if (percentUsed >= 100 && !budget.isExhausted) {
      budget.isExhausted = true;
      this.emitAlert({
        type: 'exhausted',
        keyId: entry.keyId,
        spent: budget.monthlySpentUsd,
        limit: budget.monthlyLimitUsd,
        percentUsed: 100,
        timestamp: new Date(),
      });
      console.warn(
        `[Cost] Key ${entry.keyId} budget EXHAUSTED: $${budget.monthlySpentUsd.toFixed(2)} / $${budget.monthlyLimitUsd.toFixed(2)}`
      );
    } else if (percentUsed >= budget.alertThresholdPercent && percentUsed < 100) {
      this.emitAlert({
        type: 'threshold',
        keyId: entry.keyId,
        spent: budget.monthlySpentUsd,
        limit: budget.monthlyLimitUsd,
        percentUsed,
        timestamp: new Date(),
      });
      console.warn(
        `[Cost] Key ${entry.keyId} at ${percentUsed.toFixed(1)}% budget ($${budget.monthlySpentUsd.toFixed(2)} / $${budget.monthlyLimitUsd.toFixed(2)})`
      );
    }
  }

  getMonthlySummary(
    keyId: string
  ): {
    spent: number;
    limit: number;
    percentUsed: number;
    resetDate: Date;
    isExhausted: boolean;
  } | null {
    const budget = this.budgets.get(keyId);
    if (!budget) return null;

    // Check if month has reset
    if (this.hasMonthReset(budget.resetDate)) {
      budget.monthlySpentUsd = 0;
      budget.resetDate = this.getNextMonthStart();
      budget.isExhausted = false;
    }

    return {
      spent: budget.monthlySpentUsd,
      limit: budget.monthlyLimitUsd,
      percentUsed: (budget.monthlySpentUsd / budget.monthlyLimitUsd) * 100,
      resetDate: budget.resetDate,
      isExhausted: budget.isExhausted,
    };
  }

  getCostsByModel(keyId: string): Record<string, number> {
    const costs: Record<string, number> = {};

    for (const entry of this.costEntries) {
      if (entry.keyId === keyId) {
        costs[entry.modelId] = (costs[entry.modelId] || 0) + entry.costUsd;
      }
    }

    return costs;
  }

  getCostsByProvider(keyId: string): Record<string, number> {
    const costs: Record<string, number> = {};

    for (const entry of this.costEntries) {
      if (entry.keyId === keyId) {
        costs[entry.providerId] = (costs[entry.providerId] || 0) + entry.costUsd;
      }
    }

    return costs;
  }

  onAlert(callback: (alert: CostAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  private emitAlert(alert: CostAlert): void {
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (err) {
        console.error('[Cost] Alert callback error:', err);
      }
    }
  }

  private hasMonthReset(lastResetDate: Date): boolean {
    const now = new Date();
    return now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear();
  }

  private getNextMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  isKeyBudgetExhausted(keyId: string): boolean {
    const summary = this.getMonthlySummary(keyId);
    return summary?.isExhausted || false;
  }

  getGlobalCostsSummary(): {
    totalSpent: number;
    totalBudget: number;
    keyCount: number;
    exhaustedKeys: string[];
  } {
    let totalSpent = 0;
    let totalBudget = 0;
    const exhaustedKeys: string[] = [];

    for (const [keyId, budget] of this.budgets.entries()) {
      const summary = this.getMonthlySummary(keyId);
      if (summary) {
        totalSpent += summary.spent;
        totalBudget += summary.limit;

        if (summary.isExhausted) {
          exhaustedKeys.push(keyId);
        }
      }
    }

    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      totalBudget: Math.round(totalBudget * 100) / 100,
      keyCount: this.budgets.size,
      exhaustedKeys,
    };
  }
}

const costRulesEngine = new CostRulesEngine();

export { costRulesEngine, CostRulesEngine };
