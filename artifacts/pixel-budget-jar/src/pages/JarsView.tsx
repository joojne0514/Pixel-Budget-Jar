import React from "react";
import { motion } from "framer-motion";
import { useBudget, JAR_ALLOCATIONS } from "@/hooks/useBudget";
import { JarCard } from "@/components/JarCard";
import { JarKey } from "@/hooks/useMonthData";

type Props = {
  monthKey: string;
};

export default function JarsView({ monthKey }: Props) {
  const { totalIncome, totalFixed, distributableBalance, jarBudgets, jarSpent, jarRemaining } = useBudget(monthKey);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const jars = Object.keys(JAR_ALLOCATIONS) as JarKey[];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 pb-24"
    >
      <div className="bg-card border-2 border-border rounded-2xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center divide-x-2 divide-border">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wide">Income</div>
            <div className="font-pixel text-xs sm:text-sm mt-1 text-primary">{formatter.format(totalIncome)}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wide">Fixed</div>
            <div className="font-pixel text-xs sm:text-sm mt-1 text-destructive">{formatter.format(totalFixed)}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wide">To Jars</div>
            <div className="font-pixel text-xs sm:text-sm mt-1 text-secondary-foreground">{formatter.format(distributableBalance)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {jars.map((jarKey, index) => (
          <JarCard
            key={jarKey}
            jarKey={jarKey}
            budget={jarBudgets[jarKey]}
            spent={jarSpent[jarKey]}
            remaining={jarRemaining[jarKey]}
            delay={index * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
}
