import React from "react";
import { motion } from "framer-motion";
import { useMonthData } from "@/hooks/useMonthData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useBudget } from "@/hooks/useBudget";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type Props = {
  monthKey: string;
};

export default function IncomeFixedView({ monthKey }: Props) {
  const { data, updateIncome, updateFixedExpenses, resetMonth } = useMonthData(monthKey);
  const { totalIncome, totalFixed, distributableBalance } = useBudget(monthKey);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 pb-24 max-w-lg mx-auto space-y-6"
    >
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
                />
              </div>
            </div>
          ))}
        </div>
      </div>

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
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 border-2 border-border rounded-2xl p-5 shadow-sm text-center">
        <h2 className="font-bold text-xs uppercase text-muted-foreground mb-2">Distributable Balance</h2>
        <div className="font-pixel text-xl text-secondary-foreground">
          {formatter.format(distributableBalance)}
        </div>
      </div>

      <div className="pt-4 flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="w-4 h-4 mr-2" />
              Reset Current Month
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-2">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-pixel text-xs">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="font-bold text-muted-foreground">
                This will delete all logged income, fixed expenses, and transactions for this month. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={resetMonth} className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, reset month
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

    </motion.div>
  );
}
