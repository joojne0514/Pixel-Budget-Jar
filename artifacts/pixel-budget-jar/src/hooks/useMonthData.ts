import { useState, useEffect, useCallback } from "react";

export type JarKey = "food" | "transport" | "daily" | "debt" | "investment" | "savings" | "emotional";

export type IncomeEntry = {
  id: string;
  category: "salary" | "creator" | "gift";
  amount: number;
  label: string;
};

export type FixedExpense = {
  rent: number;
  utilities: number;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  jarKey: JarKey;
  note: string;
};

export type DebtSavingsMode = "equal" | "debt-higher";

export type MonthData = {
  income: IncomeEntry[];
  fixedExpenses: FixedExpense;
  transactions: Transaction[];
  debtSavingsMode: DebtSavingsMode;
  rollovers: Partial<Record<JarKey, number>>;
};

export const DEFAULT_MONTH_DATA: MonthData = {
  income: [
    { id: "salary", category: "salary", amount: 0, label: "Salary" },
    { id: "creator", category: "creator", amount: 0, label: "Creator Income" },
    { id: "gift", category: "gift", amount: 0, label: "Gift / Support" },
  ],
  fixedExpenses: {
    rent: 0,
    utilities: 0,
  },
  transactions: [],
  debtSavingsMode: "equal",
  rollovers: {},
};

function mergeWithDefaults(stored: Partial<MonthData>): MonthData {
  return {
    ...DEFAULT_MONTH_DATA,
    ...stored,
    income: stored.income ?? DEFAULT_MONTH_DATA.income,
    fixedExpenses: stored.fixedExpenses ?? DEFAULT_MONTH_DATA.fixedExpenses,
    transactions: stored.transactions ?? [],
    debtSavingsMode: stored.debtSavingsMode ?? "equal",
    rollovers: stored.rollovers ?? {},
  };
}

export function getNextMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1 + 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function useMonthData(monthKey: string) {
  const storageKey = `pbj_${monthKey}`;

  const [data, setData] = useState<MonthData>(() => {
    try {
      const item = localStorage.getItem(storageKey);
      if (item) return mergeWithDefaults(JSON.parse(item));
    } catch (e) {
      // ignore
    }
    return DEFAULT_MONTH_DATA;
  });

  useEffect(() => {
    try {
      const item = localStorage.getItem(storageKey);
      if (item) {
        setData(mergeWithDefaults(JSON.parse(item)));
      } else {
        setData(DEFAULT_MONTH_DATA);
      }
    } catch (e) {
      setData(DEFAULT_MONTH_DATA);
    }
  }, [monthKey, storageKey]);

  const saveData = useCallback(
    (newData: MonthData) => {
      setData(newData);
      localStorage.setItem(storageKey, JSON.stringify(newData));
    },
    [storageKey]
  );

  const updateIncome = useCallback(
    (id: string, amount: number) => {
      saveData({
        ...data,
        income: data.income.map((inc) => (inc.id === id ? { ...inc, amount } : inc)),
      });
    },
    [data, saveData]
  );

  const updateFixedExpenses = useCallback(
    (rent: number, utilities: number) => {
      saveData({ ...data, fixedExpenses: { rent, utilities } });
    },
    [data, saveData]
  );

  const setDebtSavingsMode = useCallback(
    (mode: DebtSavingsMode) => {
      saveData({ ...data, debtSavingsMode: mode });
    },
    [data, saveData]
  );

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id">) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: Math.random().toString(36).substring(2, 9),
      };
      saveData({ ...data, transactions: [newTransaction, ...data.transactions] });
    },
    [data, saveData]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      saveData({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });
    },
    [data, saveData]
  );

  const resetMonth = useCallback(() => {
    saveData(DEFAULT_MONTH_DATA);
  }, [saveData]);

  const closeMonthAndRollover = useCallback(
    (jarBudgets: Record<JarKey, number>, jarSpent: Record<JarKey, number>) => {
      const unlockedJars: JarKey[] = ["food", "transport", "daily", "emotional"];
      const rollovers: Partial<Record<JarKey, number>> = {};

      for (const jar of unlockedJars) {
        const remaining = (jarBudgets[jar] ?? 0) - (jarSpent[jar] ?? 0);
        if (remaining > 0) {
          rollovers[jar] = remaining;
        }
      }

      const nextMonthKey = getNextMonthKey(monthKey);
      const nextStorageKey = `pbj_${nextMonthKey}`;

      let nextData: MonthData;
      try {
        const stored = localStorage.getItem(nextStorageKey);
        nextData = stored ? mergeWithDefaults(JSON.parse(stored)) : { ...DEFAULT_MONTH_DATA };
      } catch {
        nextData = { ...DEFAULT_MONTH_DATA };
      }

      const mergedRollovers: Partial<Record<JarKey, number>> = { ...nextData.rollovers };
      for (const [jar, amount] of Object.entries(rollovers) as [JarKey, number][]) {
        mergedRollovers[jar] = (mergedRollovers[jar] ?? 0) + amount;
      }

      nextData = { ...nextData, rollovers: mergedRollovers };
      localStorage.setItem(nextStorageKey, JSON.stringify(nextData));

      return { nextMonthKey, rollovers };
    },
    [monthKey]
  );

  return {
    data,
    updateIncome,
    updateFixedExpenses,
    setDebtSavingsMode,
    addTransaction,
    deleteTransaction,
    resetMonth,
    closeMonthAndRollover,
  };
}
