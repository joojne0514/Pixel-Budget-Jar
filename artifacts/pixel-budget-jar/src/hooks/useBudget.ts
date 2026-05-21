import { useMemo } from "react";
import { useMonthData, JarKey } from "./useMonthData";

export const JAR_LABELS: Record<JarKey, string> = {
  food: "Food",
  transport: "Transport",
  daily: "Daily Items",
  debt: "Debt Repayment",
  investment: "Investment",
  savings: "Savings",
  emotional: "Emotional Value",
};

export const LOCKED_JARS: JarKey[] = ["debt", "investment", "savings"];
export const UNLOCKED_JARS: JarKey[] = ["food", "transport", "daily", "emotional"];

export const JAR_ORDER: JarKey[] = [
  "food",
  "transport",
  "daily",
  "emotional",
  "debt",
  "investment",
  "savings",
];

export const FOOD_MINIMUM = 600;

export function useBudget(monthKey: string) {
  const { data } = useMonthData(monthKey);

  const budgetState = useMemo(() => {
    const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
    const totalFixed = data.fixedExpenses.rent + data.fixedExpenses.utilities;
    const baseBalance = Math.max(0, totalIncome - totalFixed);

    const remainingBalance = Math.max(0, baseBalance - FOOD_MINIMUM);

    const isDebtHigher = data.debtSavingsMode === "debt-higher";
    const debtPct = isDebtHigher ? 0.25 : 0.22;
    const savingsPct = isDebtHigher ? 0.19 : 0.22;

    const extraFoodBuffer = remainingBalance * 0.15;
    const rollovers = data.rollovers ?? {};

    const jarBudgets: Record<JarKey, number> = {
      food: FOOD_MINIMUM + extraFoodBuffer + (rollovers.food ?? 0),
      transport: remainingBalance * 0.05 + (rollovers.transport ?? 0),
      daily: remainingBalance * 0.05 + (rollovers.daily ?? 0),
      debt: remainingBalance * debtPct,
      investment: remainingBalance * 0.15,
      savings: remainingBalance * savingsPct,
      emotional: remainingBalance * 0.16 + (rollovers.emotional ?? 0),
    };

    const jarSpent: Record<JarKey, number> = {
      food: 0,
      transport: 0,
      daily: 0,
      debt: 0,
      investment: 0,
      savings: 0,
      emotional: 0,
    };

    data.transactions.forEach((tx) => {
      jarSpent[tx.jarKey] += tx.amount;
    });

    const jarRemaining: Record<JarKey, number> = {} as Record<JarKey, number>;
    for (const key of Object.keys(jarBudgets) as JarKey[]) {
      jarRemaining[key] = jarBudgets[key] - jarSpent[key];
    }

    const totalRolloverAdded = Object.values(rollovers).reduce((s, v) => s + (v ?? 0), 0);

    return {
      totalIncome,
      totalFixed,
      baseBalance,
      distributableBalance: baseBalance,
      jarBudgets,
      jarSpent,
      jarRemaining,
      rollovers,
      totalRolloverAdded,
      debtSavingsMode: data.debtSavingsMode,
    };
  }, [data]);

  return budgetState;
}
