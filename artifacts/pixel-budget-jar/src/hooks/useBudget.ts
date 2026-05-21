import { useMemo } from "react";
import { useMonthData, JarKey } from "./useMonthData";

export const JAR_ALLOCATIONS: Record<JarKey, number> = {
  food: 0.20,
  transport: 0.05,
  daily: 0.05,
  debt: 0.15,
  investment: 0.15,
  savings: 0.25,
  emotional: 0.15,
};

export const JAR_LABELS: Record<JarKey, string> = {
  food: "Food",
  transport: "Transport",
  daily: "Daily Items",
  debt: "Debt Repayment",
  investment: "Investment",
  savings: "Savings",
  emotional: "Emotional Value",
};

export const LOCKED_JARS: JarKey[] = ["debt", "savings"];

export function useBudget(monthKey: string) {
  const { data } = useMonthData(monthKey);

  const budgetState = useMemo(() => {
    const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
    const totalFixed = data.fixedExpenses.rent + data.fixedExpenses.utilities;
    
    // Only allocate if we have enough to cover fixed expenses
    const distributableBalance = Math.max(0, totalIncome - totalFixed);

    const jarBudgets: Record<JarKey, number> = {
      food: distributableBalance * JAR_ALLOCATIONS.food,
      transport: distributableBalance * JAR_ALLOCATIONS.transport,
      daily: distributableBalance * JAR_ALLOCATIONS.daily,
      debt: distributableBalance * JAR_ALLOCATIONS.debt,
      investment: distributableBalance * JAR_ALLOCATIONS.investment,
      savings: distributableBalance * JAR_ALLOCATIONS.savings,
      emotional: distributableBalance * JAR_ALLOCATIONS.emotional,
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

    const jarRemaining: Record<JarKey, number> = {
      food: jarBudgets.food - jarSpent.food,
      transport: jarBudgets.transport - jarSpent.transport,
      daily: jarBudgets.daily - jarSpent.daily,
      debt: jarBudgets.debt - jarSpent.debt,
      investment: jarBudgets.investment - jarSpent.investment,
      savings: jarBudgets.savings - jarSpent.savings,
      emotional: jarBudgets.emotional - jarSpent.emotional,
    };

    return {
      totalIncome,
      totalFixed,
      distributableBalance,
      jarBudgets,
      jarSpent,
      jarRemaining,
    };
  }, [data]);

  return budgetState;
}
