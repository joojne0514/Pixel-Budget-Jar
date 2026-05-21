import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  CreditCard,
  PiggyBank,
  Sparkles,
  Lock,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JarKey, LOCKED_JAR_KEYS } from "@/hooks/useMonthData";
import { JAR_LABELS } from "@/hooks/useBudget";
import { Button } from "@/components/ui/button";

const ICONS: Record<JarKey, React.ElementType> = {
  food: UtensilsCrossed,
  transport: Car,
  daily: ShoppingBag,
  debt: CreditCard,
  savings: PiggyBank,
  emotional: Sparkles,
};

const CARD_STYLES: Record<JarKey, { bg: string; icon: string; bar: string; border: string }> = {
  food:      { bg: "bg-[#FFF6F0]",  icon: "bg-[#FFDECE] text-[#C0623A]", bar: "bg-[#F4956A]",  border: "border-[#F4D0C0]" },
  transport: { bg: "bg-[#F0F6FF]",  icon: "bg-[#CCE2FF] text-[#2D6BB5]", bar: "bg-[#5B9CE6]",  border: "border-[#C4D8F5]" },
  daily:     { bg: "bg-[#FFFDF0]",  icon: "bg-[#FFF0AA] text-[#A07D10]", bar: "bg-[#E6C830]",  border: "border-[#F0E4AA]" },
  debt:      { bg: "bg-[#F5F0FF]",  icon: "bg-[#DDD0FF] text-[#6040C0]", bar: "bg-[#8B68E0]",  border: "border-[#DCD0F5]" },
  savings:   { bg: "bg-[#F0FBF8]",  icon: "bg-[#C0EDE2] text-[#1A7A60]", bar: "bg-[#40B090]",  border: "border-[#B8E8DC]" },
  emotional: { bg: "bg-[#FFF0F5]",  icon: "bg-[#FFD0E0] text-[#C03060]", bar: "bg-[#E86090]",  border: "border-[#F5C8D8]" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

type AutoBorrow = { fromJar: JarKey; amount: number };

type BudgetCardProps = {
  jarKey: JarKey;
  budget: number;
  spent: number;
  remaining: number;
  rollover?: number;
  autoBorrows?: AutoBorrow[];
  delay?: number;
  onTransferClick?: () => void;
};

export function BudgetCard({
  jarKey,
  budget,
  spent,
  remaining,
  rollover = 0,
  autoBorrows = [],
  delay = 0,
  onTransferClick,
}: BudgetCardProps) {
  const isLocked = LOCKED_JAR_KEYS.includes(jarKey as any);
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const overBudget = !isLocked && spent > budget;
  const Icon = ICONS[jarKey];
  const style = CARD_STYLES[jarKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.06, duration: 0.28, ease: "easeOut" }}
      data-testid={`budget-card-${jarKey}`}
      className={cn(
        "rounded-2xl border p-4 flex flex-col gap-3",
        style.bg,
        style.border,
        "shadow-sm"
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", style.icon)}>
            <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-gray-800">{JAR_LABELS[jarKey]}</span>
              {isLocked && (
                <span className="flex items-center gap-0.5 bg-white/70 text-gray-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-gray-200">
                  <Lock className="w-2.5 h-2.5" />
                  Locked
                </span>
              )}
            </div>
            {rollover > 0 && (
              <span className="text-[10px] text-emerald-600 font-semibold">
                +{fmt(rollover)} rollover
              </span>
            )}
          </div>
        </div>

        {onTransferClick && (
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/60"
            onClick={onTransferClick}
            data-testid={`transfer-btn-${jarKey}`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Amounts row */}
      <div className="grid grid-cols-3 gap-1 text-center">
        <div>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Budget</p>
          <p className="text-sm font-bold text-gray-700">{fmt(budget)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">
            {isLocked ? "Saved" : "Spent"}
          </p>
          <p className={cn("text-sm font-bold", overBudget ? "text-red-500" : "text-gray-700")}>{fmt(spent)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-0.5">Left</p>
          <p className={cn("text-sm font-bold", remaining < 0 ? "text-red-500" : "text-gray-700")}>{fmt(remaining)}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden border border-white/40">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: overBudget ? "#EF4444" : style.bar.replace("bg-[", "").replace("]", "") }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, pct)}%` }}
            transition={{ duration: 0.7, delay: delay * 0.06 + 0.1, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1 font-medium">{pct.toFixed(0)}% used</p>
      </div>

      {/* Over-budget warning */}
      {overBudget && (
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 text-red-600 text-[11px] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Over budget by {fmt(spent - budget)}
        </div>
      )}

      {/* Auto-borrow tags */}
      {autoBorrows.length > 0 && (
        <div className="flex flex-col gap-1">
          {autoBorrows.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-amber-700 text-[11px] font-semibold"
            >
              <ArrowLeftRight className="w-3 h-3 shrink-0" />
              Covered {fmt(b.amount)} from {JAR_LABELS[b.fromJar]}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
