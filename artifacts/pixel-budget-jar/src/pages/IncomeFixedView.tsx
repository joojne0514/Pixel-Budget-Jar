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
import { Trash2, ArrowRightLeft } from "lucide-react";
import { IncomeJar } from "@/components/IncomeJar";
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

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const handleRolloverConfirm = (choices: Parameters<typeof closeMonthWithChoices>[0]) => {
    const { nextMonthKey } = closeMonthWithChoices(choices, jarRemaining);
    setRolloverOpen(false);
    onMonthChange(nextMonthKey);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 pb-24 max-w-lg mx-auto space-y-5"
    >
      {/* Income Jars */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-[2px_4px_0px_rgba(0,0,0,0.12)] space-y-4">
        <h2 className="font-pixel text-[10px] tracking-wide text-primary">Income Jars</h2>
        <div className="grid grid-cols-3 gap-3">
          {data.income.map((inc) => (
            <IncomeJar
              key={inc.id}
              id={inc.id}
              label={inc.label}
              category={inc.category}
              amount={inc.amount}
              onSave={updateIncome}
            />
          ))}
        </div>
      </div>

      {/* Fixed Expenses */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-[2px_4px_0px_rgba(0,0,0,0.12)] space-y-4">
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

      {/* Budget breakdown note */}
      <div className="bg-card border-2 border-border rounded-2xl p-4 shadow-sm text-center space-y-1">
        <p className="font-pixel text-[8px] text-muted-foreground">Allocation (of remaining after food minimum)</p>
        <div className="grid grid-cols-3 gap-1 mt-2 text-[9px] font-bold text-muted-foreground">
          <span>Transport 5%</span>
          <span>Daily 5%</span>
          <span>Emotional 16%</span>
          <span>Debt 29.5%</span>
          <span>Savings 29.5%</span>
          <span>Food buffer 20%</span>
        </div>
        <p className="text-[9px] text-primary font-bold mt-1">Food min $600 + 20% buffer</p>
      </div>

      {/* Close Month & Roll Over */}
      <div className="bg-card border-2 border-border rounded-2xl p-5 shadow-[2px_4px_0px_rgba(0,0,0,0.12)] space-y-3">
        <h2 className="font-pixel text-[10px] tracking-wide text-foreground">End of Month</h2>
        <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
          Choose where to send leftover money from each unlocked jar.
          Locked jars (Debt, Savings) are not affected.
        </p>
        <Button
          className="w-full h-12 rounded-xl font-pixel text-[9px] bg-secondary text-secondary-foreground hover:bg-secondary/90 border-2 border-secondary shadow-[2px_4px_0px_rgba(0,0,0,0.1)]"
          onClick={() => setRolloverOpen(true)}
          data-testid="button-close-month"
        >
          <ArrowRightLeft className="w-4 h-4 mr-2" />
          Close Month & Roll Over
        </Button>
      </div>

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

      <RolloverModal
        open={rolloverOpen}
        onClose={() => setRolloverOpen(false)}
        jarRemaining={jarRemaining}
        onConfirm={handleRolloverConfirm}
      />
    </motion.div>
  );
}
