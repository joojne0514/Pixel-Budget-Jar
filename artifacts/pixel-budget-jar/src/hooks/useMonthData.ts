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

export type MonthData = {
  income: IncomeEntry[];
  fixedExpenses: FixedExpense;
  transactions: Transaction[];
};

const defaultData: MonthData = {
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
};

export function useMonthData(monthKey: string) {
  const storageKey = `pbj_${monthKey}`;
  
  const [data, setData] = useState<MonthData>(() => {
    try {
      const item = localStorage.getItem(storageKey);
      if (item) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.error("Failed to parse localStorage data", e);
    }
    return defaultData;
  });

  useEffect(() => {
    try {
      const item = localStorage.getItem(storageKey);
      if (item) {
        setData(JSON.parse(item));
      } else {
        setData(defaultData);
      }
    } catch (e) {
      console.error("Failed to read localStorage on month change", e);
      setData(defaultData);
    }
  }, [monthKey, storageKey]);

  const saveData = useCallback((newData: MonthData) => {
    setData(newData);
    localStorage.setItem(storageKey, JSON.stringify(newData));
  }, [storageKey]);

  const updateIncome = useCallback((id: string, amount: number) => {
    saveData({
      ...data,
      income: data.income.map((inc) => 
        inc.id === id ? { ...inc, amount } : inc
      ),
    });
  }, [data, saveData]);

  const updateFixedExpenses = useCallback((rent: number, utilities: number) => {
    saveData({
      ...data,
      fixedExpenses: { rent, utilities },
    });
  }, [data, saveData]);

  const addTransaction = useCallback((transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 9),
    };
    saveData({
      ...data,
      transactions: [newTransaction, ...data.transactions],
    });
  }, [data, saveData]);

  const deleteTransaction = useCallback((id: string) => {
    saveData({
      ...data,
      transactions: data.transactions.filter(t => t.id !== id),
    });
  }, [data, saveData]);

  const resetMonth = useCallback(() => {
    saveData(defaultData);
  }, [saveData]);

  return {
    data,
    updateIncome,
    updateFixedExpenses,
    addTransaction,
    deleteTransaction,
    resetMonth,
  };
}
