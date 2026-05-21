import React from "react";
import { motion } from "framer-motion";
import { JarKey } from "@/hooks/useMonthData";
import { LOCKED_JARS, JAR_LABELS } from "@/hooks/useBudget";
import { Lock, Coffee, Bus, ShoppingBag, PiggyBank, Heart, TrendingUp, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  jarKey: JarKey;
  budget: number;
  spent: number;
  remaining: number;
  rollover?: number;
  delay?: number;
};

const JAR_ICONS: Record<JarKey, React.ElementType> = {
  food: Coffee,
  transport: Bus,
  daily: ShoppingBag,
  debt: CreditCard,
  investment: TrendingUp,
  savings: PiggyBank,
  emotional: Heart,
};

export function JarCard({ jarKey, budget, spent, remaining, rollover = 0, delay = 0 }: Props) {
  const isLocked = LOCKED_JARS.includes(jarKey);
  const JarIcon = JAR_ICONS[jarKey];
  const percentSpent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const overBudget = spent > budget;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      data-testid={`jar-card-${jarKey}`}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 shadow-md p-4 flex flex-col gap-3",
        isLocked
          ? "bg-muted/60 border-dashed border-muted-foreground/30"
          : `bg-pastel-${jarKey} border-border`
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-xl bg-white/50 backdrop-blur-sm relative",
              `text-pastel-${jarKey}`
            )}
          >
            <JarIcon className="w-5 h-5" />
            {isLocked && (
              <div className="absolute -top-1.5 -right-1.5 bg-foreground rounded-full p-0.5">
                <Lock className="w-2.5 h-2.5 text-background" />
              </div>
            )}
          </div>
          <span className="text-[10px] font-pixel leading-tight max-w-[100px] text-card-foreground">
            {JAR_LABELS[jarKey]}
          </span>
        </div>
        {isLocked && (
          <div className="bg-foreground/80 text-background text-[8px] font-pixel px-2 py-1 rounded-full uppercase tracking-wider">
            LOCKED
          </div>
        )}
      </div>

      <div className="mt-1">
        <div className={cn("text-2xl font-bold tracking-tight", isLocked ? "text-muted-foreground" : "text-card-foreground")}>
          {formatter.format(remaining)}
        </div>
        <div className="text-xs text-card-foreground/70 font-semibold uppercase tracking-wider">
          Remaining
        </div>
      </div>

      {rollover > 0 && !isLocked && (
        <div className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
          +{formatter.format(rollover)} rolled over
        </div>
      )}

      <div className="mt-auto pt-1 space-y-1.5">
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
              overBudget
                ? "bg-destructive"
                : isLocked
                ? "bg-muted-foreground/40"
                : `bg-pastel-${jarKey} brightness-75`
            )}
          />
        </div>
      </div>
    </motion.div>
  );
}
