import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMonthData, DebtSavingsMode } from "@/hooks/useMonthData";
import { useBudget } from "@/hooks/useBudget";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, ChevronRight, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  monthKey: string;
  onMonthChange: (key: string) => void;
};

export default function IncomeFixedView({ monthKey, onMonthChange }: Props) {
  const { data, updateIncome, updateFixedExpenses, setDebtSavingsMode, resetMonth, closeMonthAndRollover } =
    useMonthData(monthKey);
  const { totalIncome, totalFixed, baseBalance, jarBudgets, jarSpent } = useBudget(monthKey);
  const [rolloverResult, setRolloverResult] = useState<null | { nextMonthKey: string; rollovers: Partial<Record<string, number>> }>(null);

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const handleCloseMonth = () => {
    const result = closeMonthAndRollover(jarBudgets, jarSpent);
    setRolloverResult(result);
  };

  const handleNavigateToNext = () => {
    if (rolloverResult) {
      onMonthChange(rolloverResult.nextMonthKey);
      setRolloverResult(null);
    }
  };

  const rolloverEntries = rolloverResult
    ? Object.entries(rolloverResult.rollovers).filter(([, v]) => (v ?? 0) > 0)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 pb-24 max-w-lg mx-auto space-y-5"
    >
      {/* Income */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-pixel text-[10px] tracking-wide text-primary">Monthly Income</h2>
        <div className="space-y-4">
          {data.income.map((inc) => (
            <div key={inc.id} className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">{inc.label}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-pixel text-muted-foreground text-xs">$</span>
                <Input
                  type="number"
                  value={inc.amount || ""}
                  onChange={(e) => updateIncome(inc.id, Number(e.target.value))}
                  className="pl-8 font-bold bg-background h-12 rounded-xl"
                  placeholder="0"
                  data-testid={`input-income-${inc.id}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Expenses */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-pixel text-[10px] tracking-wide text-destructive">Fixed Expenses</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Rent / Mortgage</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-pixel text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                value={data.fixedExpenses.rent || ""}
                onChange={(e) => updateFixedExpenses(Number(e.target.value), data.fixedExpenses.utilities)}
                className="pl-8 font-bold bg-background h-12 rounded-xl"
                placeholder="0"
                data-testid="input-rent"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Utilities / Internet</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-pixel text-muted-foreground text-xs">$</span>
              <Input
                type="number"
                value={data.fixedExpenses.utilities || ""}
                onChange={(e) => updateFixedExpenses(data.fixedExpenses.rent, Number(e.target.value))}
                className="pl-8 font-bold bg-background h-12 rounded-xl"
                placeholder="0"
                data-testid="input-utilities"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Debt / Savings Toggle */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="font-pixel text-[10px] tracking-wide text-foreground">Debt & Savings Split</h2>
        <p className="text-xs text-muted-foreground font-semibold">
          How to allocate between Debt Repayment and Savings jars
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "equal", label: "Equal Split", sub: "Debt 22% / Savings 22%" },
              { value: "debt-higher", label: "Debt Priority", sub: "Debt 25% / Savings 19%" },
            ] as { value: DebtSavingsMode; label: string; sub: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              data-testid={`toggle-debt-savings-${opt.value}`}
              onClick={() => setDebtSavingsMode(opt.value)}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-all",
                data.debtSavingsMode === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-muted/50"
              )}
            >
              <div className="text-xs font-bold text-foreground">{opt.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 font-semibold">{opt.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Balance Summary */}
      <div className="bg-muted/50 border-2 border-border rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center divide-x-2 divide-border">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Income</div>
            <div className="font-pixel text-xs mt-1 text-primary">{formatter.format(totalIncome)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Fixed</div>
            <div className="font-pixel text-xs mt-1 text-destructive">{formatter.format(totalFixed)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Base</div>
            <div className="font-pixel text-xs mt-1 text-secondary-foreground">{formatter.format(baseBalance)}</div>
          </div>
        </div>
      </div>

      {/* Close Month & Roll Over */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="font-pixel text-[10px] tracking-wide text-foreground">End of Month</h2>
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          Close this month and roll unused unlocked jar balances into next month's same categories.
          Locked jars (Debt, Investment, Savings) do not roll over.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full h-12 rounded-xl font-pixel text-[9px] bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-secondary"
              data-testid="button-close-month"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Close Month & Roll Over
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-pixel text-xs">Close this month?</AlertDialogTitle>
              <AlertDialogDescription className="font-bold text-muted-foreground text-sm leading-relaxed">
                Unused balances from Food, Transport, Daily Items, and Emotional Value will be added to
                next month's budget for the same jars. Locked jars stay as-is.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCloseMonth}
                className="rounded-xl font-bold"
                data-testid="button-confirm-close-month"
              >
                Roll Over
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Rollover success panel */}
      {rolloverResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border-2 border-green-300 rounded-2xl p-5 space-y-3"
        >
          <h3 className="font-pixel text-[10px] text-green-700">Rolled Over!</h3>
          {rolloverEntries.length > 0 ? (
            <ul className="space-y-1">
              {rolloverEntries.map(([jar, amount]) => (
                <li key={jar} className="flex justify-between text-sm font-bold text-green-800">
                  <span className="capitalize">{jar}</span>
                  <span>+{formatter.format(amount ?? 0)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-green-700 font-semibold">No unused balances to roll over.</p>
          )}
          <Button
            onClick={handleNavigateToNext}
            className="w-full h-10 rounded-xl font-bold text-xs mt-2 bg-green-600 hover:bg-green-700 text-white"
            data-testid="button-go-to-next-month"
          >
            Go to Next Month <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      )}

      {/* Reset */}
      <div className="pt-2 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
              data-testid="button-reset-month"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Current Month
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-pixel text-xs">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="font-bold text-muted-foreground">
                This will delete all income, fixed expenses, and transactions for this month. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={resetMonth}
                className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-reset"
              >
                Yes, reset month
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
