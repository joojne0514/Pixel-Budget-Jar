import { useState, useEffect, useCallback } from "react";

export type JarKey = "food" | "transport" | "daily" | "debt" | "savings" | "emotional";

export type LockedJarKey = "debt";
export const LOCKED_JAR_KEYS: LockedJarKey[] = ["debt"];
export const UNLOCKED_JAR_KEYS: JarKey[] = ["food", "transport", "daily", "emotional", "savings"];

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

export type Transfer = {
  id: string;
  date: string;
  fromJar: JarKey;
  toJar: JarKey;
  amount: number;
  note: string;
  auto: boolean;
};

export type RolloverChoice = "same" | "debt" | "savings";

export type MonthData = {
  income: IncomeEntry[];
  fixedExpenses: FixedExpense;
  transactions: Transaction[];
  transfers: Transfer[];
  /** unlocked jar amounts added to budget from previous month rollover */
  rollovers: Partial<Record<JarKey, number>>;
  /** amounts added to locked jar budgets from previous month rollover choices */
  lockedContributions: Partial<Record<LockedJarKey, number>>;
};

export const DEFAULT_MONTH_DATA: MonthData = {
  income: [
    { id: "salary", category: "salary", amount: 0, label: "Salary" },
    { id: "creator", category: "creator", amount: 0, label: "Creator Income" },
    { id: "gift", category: "gift", amount: 0, label: "Gift / Support" },
  ],
  fixedExpenses: { rent: 0, utilities: 0 },
  transactions: [],
  transfers: [],
  rollovers: {},
  lockedContributions: {},
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function mergeWithDefaults(stored: Partial<MonthData>): MonthData {
  return {
    ...DEFAULT_MONTH_DATA,
    ...stored,
    income: stored.income ?? DEFAULT_MONTH_DATA.income,
    fixedExpenses: stored.fixedExpenses ?? DEFAULT_MONTH_DATA.fixedExpenses,
    transactions: stored.transactions ?? [],
    transfers: stored.transfers ?? [],
    rollovers: stored.rollovers ?? {},
    lockedContributions: stored.lockedContributions ?? {},
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
    } catch (_) { /* ignore */ }
    return DEFAULT_MONTH_DATA;
  });

  useEffect(() => {
    try {
      const item = localStorage.getItem(storageKey);
      setData(item ? mergeWithDefaults(JSON.parse(item)) : DEFAULT_MONTH_DATA);
    } catch (_) {
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

  /**
   * Add an expense transaction. If autoTransfers are provided (for overspend coverage),
   * they are saved together atomically.
   */
  const addExpense = useCallback(
    (
      transaction: Omit<Transaction, "id">,
      autoTransfers: Omit<Transfer, "id">[] = []
    ) => {
      const newTx: Transaction = { ...transaction, id: generateId() };
      const newTransfers: Transfer[] = autoTransfers.map((t) => ({
        ...t,
        id: generateId(),
      }));
      saveData({
        ...data,
        transactions: [newTx, ...data.transactions],
        transfers: [...newTransfers, ...data.transfers],
      });
    },
    [data, saveData]
  );

  /**
   * Add a manual transfer between jars.
   * Validates transfer rules:
   * - Locked jars (Debt only) cannot send OUT to any jar.
   * - Unlocked jars can send to any other jar.
   */
  const addTransfer = useCallback(
    (transfer: Omit<Transfer, "id" | "auto">) => {
      const { fromJar } = transfer;
      const fromLocked = LOCKED_JAR_KEYS.includes(fromJar as LockedJarKey);

      if (fromLocked) {
        throw new Error("Cannot transfer out of a locked jar.");
      }

      const newTransfer: Transfer = { ...transfer, id: generateId(), auto: false };
      saveData({ ...data, transfers: [newTransfer, ...data.transfers] });
    },
    [data, saveData]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      saveData({ ...data, transactions: data.transactions.filter((t) => t.id !== id) });
    },
    [data, saveData]
  );

  const deleteTransfer = useCallback(
    (id: string) => {
      saveData({ ...data, transfers: data.transfers.filter((t) => t.id !== id) });
    },
    [data, saveData]
  );

  const resetMonth = useCallback(() => {
    saveData(DEFAULT_MONTH_DATA);
  }, [saveData]);

  /**
   * Close the month and apply rollover choices.
   * choices: per unlocked jar — "same" (roll to next month same jar), "debt", or "savings".
   * jarRemaining: current remaining balances passed from useBudget.
   */
  const closeMonthWithChoices = useCallback(
    (
      choices: Partial<Record<JarKey, RolloverChoice>>,
      jarRemaining: Record<JarKey, number>
    ) => {
      const nextMonthKey = getNextMonthKey(monthKey);
      const nextStorageKey = `pbj_${nextMonthKey}`;

      let nextData: MonthData;
      try {
        const stored = localStorage.getItem(nextStorageKey);
        nextData = stored ? mergeWithDefaults(JSON.parse(stored)) : { ...DEFAULT_MONTH_DATA };
      } catch {
        nextData = { ...DEFAULT_MONTH_DATA };
      }

      const newRollovers = { ...nextData.rollovers };
      const newLockedContributions = { ...nextData.lockedContributions };

      for (const jar of UNLOCKED_JAR_KEYS) {
        const remaining = jarRemaining[jar] ?? 0;
        if (remaining <= 0) continue;

        const choice = choices[jar] ?? "same";
        if (choice === "same") {
          newRollovers[jar] = (newRollovers[jar] ?? 0) + remaining;
        } else if (choice === "debt") {
          newLockedContributions.debt = (newLockedContributions.debt ?? 0) + remaining;
        } else if (choice === "savings") {
          newLockedContributions.savings = (newLockedContributions.savings ?? 0) + remaining;
        }
      }

      nextData = {
        ...nextData,
        rollovers: newRollovers,
        lockedContributions: newLockedContributions,
      };
      localStorage.setItem(nextStorageKey, JSON.stringify(nextData));

      return { nextMonthKey };
    },
    [monthKey]
  );

  return {
    data,
    updateIncome,
    updateFixedExpenses,
    addExpense,
    addTransfer,
    deleteTransaction,
    deleteTransfer,
    resetMonth,
    closeMonthWithChoices,
  };
}
