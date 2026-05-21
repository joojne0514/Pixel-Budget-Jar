import React from "react";
import { motion } from "framer-motion";
import { JarKey, LOCKED_JARS, JAR_LABELS } from "@/hooks/useBudget";
import { Lock, Coffee, Bus, ShoppingBag, PiggyBank, Heart, TrendingUp, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  jarKey: JarKey;
  budget: number;
  spent: number;
  remaining: number;
  delay?: number;
};

const ICONS: Record<JarKey, React.ElementType> = {
  food: Coffee,
  transport: Bus,
  daily: ShoppingBag,
  debt: CreditCard,
  investment: TrendingUp,
  savings: PiggyBank,
  emotional: Heart,
};

export function JarCard({ jarKey, budget, spent, remaining, delay = 0 }: Props) {
  const isLocked = LOCKED_JARS.includes(jarKey);
  const Icon = isLocked ? Lock : ICONS[jarKey];
  const percentSpent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget;

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
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-border shadow-md p-4 flex flex-col gap-3",
        isLocked ? "bg-muted opacity-80 border-dashed" : `bg-pastel-${jarKey}`
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-xl bg-white/50 backdrop-blur-sm",
            `text-pastel-${jarKey}`
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-pixel leading-tight max-w-[100px] text-card-foreground">
            {JAR_LABELS[jarKey]}
          </span>
        </div>
        {isLocked && (
          <div className="bg-foreground text-background text-[8px] font-pixel px-2 py-1 rounded-full uppercase tracking-wider">
            LOCKED
          </div>
        )}
      </div>

      <div className="mt-2">
        <div className="text-2xl font-bold tracking-tight text-card-foreground">
          {formatter.format(remaining)}
        </div>
        <div className="text-xs text-card-foreground/70 font-semibold uppercase tracking-wider">
          Remaining
        </div>
      </div>

      <div className="mt-auto pt-2 space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-card-foreground/80">
          <span>{formatter.format(spent)} spent</span>
          <span>{formatter.format(budget)}</span>
        </div>
        <div className="h-3 w-full bg-white/60 rounded-full overflow-hidden border border-black/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentSpent}%` }}
            transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-colors",
              overBudget ? "bg-destructive" : `bg-pastel-${jarKey} brightness-75`
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}
