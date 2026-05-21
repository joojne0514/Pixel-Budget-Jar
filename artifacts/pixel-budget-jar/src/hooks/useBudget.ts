import { useMemo } from "react";
import { useMonthData, JarKey, LOCKED_JAR_KEYS, UNLOCKED_JAR_KEYS } from "./useMonthData";

export const JAR_LABELS: Record<JarKey, string> = {
  food: "Food",
  transport: "Transport",
  daily: "Daily Items",
  debt: "Debt Repayment",
  savings: "Savings",
  emotional: "Emotional Value",
};

export const LOCKED_JARS: JarKey[] = ["debt"];
export const UNLOCKED_JARS: JarKey[] = ["food", "transport", "daily", "emotional", "savings"];

export const JAR_ORDER: JarKey[] = [
  "food",
  "transport",
  "daily",
  "emotional",
  "debt",
  "savings",
];

export const FOOD_MINIMUM = 600;

/** New fixed percentages applied to Remaining Balance (Base Balance - 600) */
export const JAR_PCT: Record<JarKey, number> = {
  food: 0,        // handled separately: 600 + 20% extra buffer
  transport: 0.05,
  daily: 0.05,
  debt: 0.295,
  savings: 0.295,
  emotional: 0.16,
};
export const EXTRA_FOOD_BUFFER_PCT = 0.20;

export function useBudget(monthKey: string) {
  const { data } = useMonthData(monthKey);

  return useMemo(() => {
    const totalIncome = data.income.reduce((s, i) => s + i.amount, 0);
    const totalFixed = data.fixedExpenses.rent + data.fixedExpenses.utilities;
    const baseBalance = Math.max(0, totalIncome - totalFixed);
    const remainingBalance = Math.max(0, baseBalance - FOOD_MINIMUM);

    const rollovers = data.rollovers ?? {};
    const lockedContributions = data.lockedContributions ?? {};

    // -- transfers aggregation --
    const tIn: Record<JarKey, number> = { food: 0, transport: 0, daily: 0, debt: 0, savings: 0, emotional: 0 };
    const tOut: Record<JarKey, number> = { food: 0, transport: 0, daily: 0, debt: 0, savings: 0, emotional: 0 };

    for (const t of data.transfers) {
      tIn[t.toJar] = (tIn[t.toJar] ?? 0) + t.amount;
      tOut[t.fromJar] = (tOut[t.fromJar] ?? 0) + t.amount;
    }

    // -- formula budgets --
    const formulaBudgets: Record<JarKey, number> = {
      food: FOOD_MINIMUM + remainingBalance * EXTRA_FOOD_BUFFER_PCT,
      transport: remainingBalance * JAR_PCT.transport,
      daily: remainingBalance * JAR_PCT.daily,
      debt: remainingBalance * JAR_PCT.debt,
      savings: remainingBalance * JAR_PCT.savings,
      emotional: remainingBalance * JAR_PCT.emotional,
    };

    // -- effective budgets (include rollovers + transfers) --
    const jarBudgets: Record<JarKey, number> = {
      food: formulaBudgets.food + (rollovers.food ?? 0) + tIn.food - tOut.food,
      transport: formulaBudgets.transport + (rollovers.transport ?? 0) + tIn.transport - tOut.transport,
      daily: formulaBudgets.daily + (rollovers.daily ?? 0) + tIn.daily - tOut.daily,
      emotional: formulaBudgets.emotional + (rollovers.emotional ?? 0) + tIn.emotional - tOut.emotional,
      // locked: formula + locked contributions from last month + transfers
      debt: formulaBudgets.debt + (lockedContributions.debt ?? 0) + tIn.debt - tOut.debt,
      savings: formulaBudgets.savings + (lockedContributions.savings ?? 0) + tIn.savings - tOut.savings,
    };

    // -- spending / contributions per jar --
    const jarSpent: Record<JarKey, number> = { food: 0, transport: 0, daily: 0, debt: 0, savings: 0, emotional: 0 };
    for (const tx of data.transactions) {
      jarSpent[tx.jarKey] = (jarSpent[tx.jarKey] ?? 0) + tx.amount;
    }

    // -- remaining --
    const jarRemaining: Record<JarKey, number> = {} as Record<JarKey, number>;
    for (const key of JAR_ORDER) {
      jarRemaining[key] = jarBudgets[key] - jarSpent[key];
    }

    const totalRolloverAdded =
      Object.values(rollovers).reduce((s, v) => s + (v ?? 0), 0) +
      Object.values(lockedContributions).reduce((s, v) => s + (v ?? 0), 0);

    return {
      totalIncome,
      totalFixed,
      baseBalance,
      distributableBalance: baseBalance,
      formulaBudgets,
      jarBudgets,
      jarSpent,
      jarRemaining,
      rollovers,
      lockedContributions,
      totalRolloverAdded,
      transfersIn: tIn,
      transfersOut: tOut,
    };
  }, [data]);
}

/**
 * Compute auto-coverage transfers needed when an expense would overdraw an unlocked jar.
 * Returns an array of auto-transfer objects (without IDs).
 */
export function computeAutoCoverage(
  jarKey: JarKey,
  expenseAmount: number,
  jarRemaining: Record<JarKey, number>
): Array<{ fromJar: JarKey; toJar: JarKey; amount: number; note: string; date: string; auto: true }> {
  const currentRemaining = jarRemaining[jarKey] ?? 0;
  if (expenseAmount <= currentRemaining) return [];

  let deficit = expenseAmount - currentRemaining;
  const result: Array<{ fromJar: JarKey; toJar: JarKey; amount: number; note: string; date: string; auto: true }> = [];

  // Only pull from other unlocked jars, sorted by remaining balance descending
  const donors = UNLOCKED_JARS
    .filter((k) => k !== jarKey && (jarRemaining[k] ?? 0) > 0)
    .sort((a, b) => (jarRemaining[b] ?? 0) - (jarRemaining[a] ?? 0));

  for (const donor of donors) {
    if (deficit <= 0) break;
    const available = Math.max(0, jarRemaining[donor] ?? 0);
    const pull = Math.min(available, deficit);
    if (pull > 0) {
      result.push({
        fromJar: donor,
        toJar: jarKey,
        amount: pull,
        note: `Auto-covered ${JAR_LABELS[jarKey]} overspend`,
        date: new Date().toISOString(),
        auto: true,
      });
      deficit -= pull;
    }
  }

  return result;
}
