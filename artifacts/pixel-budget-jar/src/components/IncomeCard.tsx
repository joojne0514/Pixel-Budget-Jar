import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Star, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Category = "salary" | "creator" | "gift";

const ICONS: Record<Category, React.ElementType> = {
  salary:  Briefcase,
  creator: Star,
  gift:    Gift,
};

const STYLES: Record<Category, { bg: string; icon: string; border: string }> = {
  salary:  { bg: "bg-[#F0FBF8]", icon: "bg-[#C0EDE2] text-[#1A7A60]", border: "border-[#B8E8DC]" },
  creator: { bg: "bg-[#FFFDF0]", icon: "bg-[#FFF0AA] text-[#A07D10]", border: "border-[#F0E4AA]" },
  gift:    { bg: "bg-[#FFF0F5]", icon: "bg-[#FFD0E0] text-[#C03060]", border: "border-[#F5C8D8]" },
};

type IncomeCardProps = {
  id: string;
  label: string;
  category: Category;
  amount: number;
  onSave: (id: string, amount: number) => void;
};

export function IncomeCard({ id, label, category, amount, onSave }: IncomeCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(amount.toString());
  const [showPlus, setShowPlus] = useState(false);
  const [plusAmount, setPlusAmount] = useState(0);

  const Icon = ICONS[category];
  const style = STYLES[category];

  const commit = () => {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) {
      if (val > amount) {
        setPlusAmount(val - amount);
        setShowPlus(true);
        setTimeout(() => setShowPlus(false), 1500);
      }
      onSave(id, val);
    } else {
      setDraft(amount.toString());
    }
    setEditing(false);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 flex flex-col gap-3 shadow-sm",
        style.bg,
        style.border
      )}
    >
      {/* Float-up animation */}
      <AnimatePresence>
        {showPlus && (
          <motion.span
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -28 }}
            exit={{}}
            transition={{ duration: 1 }}
            className="absolute top-2 right-3 text-emerald-600 text-xs font-bold pointer-events-none"
          >
            +{fmt(plusAmount)}
          </motion.span>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", style.icon)}>
          <Icon style={{ width: 18, height: 18 }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
          {editing ? (
            <div className="relative mt-0.5">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input
                autoFocus
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => e.key === "Enter" && commit()}
                className="pl-5 h-8 text-sm font-bold bg-white/80 border-gray-200 rounded-lg"
              />
            </div>
          ) : (
            <button
              onClick={() => { setDraft(amount.toString()); setEditing(true); }}
              className="text-lg font-bold text-gray-800 hover:text-gray-600 transition-colors text-left"
            >
              {fmt(amount)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
