import { useState } from "react";
import { motion } from "framer-motion";
import { useMonthData } from "@/hooks/useMonthData";
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
import { Trash2, ArrowRightLeft, Info } from "lucide-react";
import { IncomeCard } from "@/components/IncomeCard";
import { RolloverModal } from "@/components/RolloverModal";

type Props = {
  monthKey: string;
  onMonthChange: (key: string) => void;
};

export default function IncomeFixedView({ monthKey, onMonthChange }: Props) {
  const { data, updateIncome, updateFixedExpenses, resetMonth, closeMonthWithChoices } =
    useMonthData(monthKey);
  const { totalIncome, totalFixed, baseBalance, jarRemaining } = useBudget(monthKey);
  const [rolloverOpen, setRolloverOpen] = useState(false);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const handleRolloverConfirm = (choices: Parameters<typeof closeMonthWithChoices>[0]) => {
    const { nextMonthKey } = closeMonthWithChoices(choices, jarRemaining);
    setRolloverOpen(false);
    onMonthChange(nextMonthKey);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 pb-28 max-w-lg mx-auto space-y-4"
    >
      {/* Income */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Income</h2>
        <div className="grid grid-cols-1 gap-3">
          {data.income.map((inc) => (
            <IncomeCard
              key={inc.id}
              id={inc.id}
              label={inc.label}
              category={inc.category}
              amount={inc.amount}
              onSave={updateIncome}
            />
          ))}
        </div>
      </section>

      {/* Fixed Expenses */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Fixed Expenses</h2>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Rent / Mortgage
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input
                type="number"
                value={data.fixedExpenses.rent || ""}
                onChange={(e) => updateFixedExpenses(Number(e.target.value), data.fixedExpenses.utilities)}
                className="pl-7 h-11 rounded-xl border-gray-200 bg-gray-50 font-semibold"
                placeholder="0"
                data-testid="input-rent"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
              Utilities / Internet
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input
                type="number"
                value={data.fixedExpenses.utilities || ""}
                onChange={(e) => updateFixedExpenses(data.fixedExpenses.rent, Number(e.target.value))}
                className="pl-7 h-11 rounded-xl border-gray-200 bg-gray-50 font-semibold"
                placeholder="0"
                data-testid="input-utilities"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Balance Summary */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Summary</h2>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="p-4 text-center">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Income</p>
              <p className="text-sm font-bold text-gray-800">{fmt(totalIncome)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Fixed</p>
              <p className="text-sm font-bold text-gray-800">{fmt(totalFixed)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Base</p>
              <p className="text-sm font-bold text-emerald-600">{fmt(baseBalance)}</p>
            </div>
          </div>
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
            <div className="flex items-start gap-2 text-[10px] text-gray-400 font-medium">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <span>Food min $600 + 20% buffer · Transport 5% · Daily 5% · Emotional 16% · Debt 29.5% · Savings 29.5%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Close Month */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Month End</h2>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-sm text-gray-500 leading-relaxed">
            Choose where leftover balances from each unlocked category go next month.
            Locked jars (Debt, Savings) are unaffected.
          </p>
          <Button
            className="w-full h-11 rounded-xl font-semibold text-sm bg-[#F5F0FF] text-[#6040C0] border border-[#DCD0F5] hover:bg-[#EDE0FF] shadow-none"
            onClick={() => setRolloverOpen(true)}
            data-testid="button-close-month"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Close Month & Roll Over
          </Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-1 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-600 hover:bg-red-50 text-xs font-semibold"
              data-testid="button-reset-month"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Reset This Month
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border border-gray-100 shadow-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-bold text-gray-800">Reset this month?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                This deletes all income, expenses, and transactions for this month. It cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={resetMonth}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
                data-testid="button-confirm-reset"
              >
                Yes, reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <RolloverModal
        open={rolloverOpen}
        onClose={() => setRolloverOpen(false)}
        jarRemaining={jarRemaining}
        onConfirm={handleRolloverConfirm}
      />
    </motion.div>
  );
}
