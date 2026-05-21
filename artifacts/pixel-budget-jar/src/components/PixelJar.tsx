import { motion } from "framer-motion";
import { JarKey, LOCKED_JAR_KEYS } from "@/hooks/useMonthData";
import { JAR_LABELS } from "@/hooks/useBudget";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type PixelJarProps = {
  jarKey: JarKey;
  label: string;
  budget: number;
  spent: number;
  remaining: number;
  rollover?: number;
  autoBorrows?: Array<{ fromJar: JarKey; amount: number }>;
  delay?: number;
  onClick?: () => void;
};

const JAR_LIQUID_COLORS: Record<JarKey, string> = {
  food:      "#ffc4b0",
  transport: "#a8d4f8",
  daily:     "#ffe8a0",
  debt:      "#b8b8e8",
  savings:   "#d8c0f8",
  emotional: "#ffb8d8",
};

const JAR_LID_COLORS: Record<JarKey, string> = {
  food:      "#f0a090",
  transport: "#88b8e8",
  daily:     "#f0cc70",
  debt:      "#9898d0",
  savings:   "#b898e0",
  emotional: "#f098b8",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

export function PixelJar({
  jarKey,
  label,
  budget,
  spent,
  remaining,
  rollover = 0,
  autoBorrows = [],
  delay = 0,
  onClick,
}: PixelJarProps) {
  const isLocked = LOCKED_JAR_KEYS.includes(jarKey as any);
  const fillPct = budget > 0 ? Math.min(100, Math.max(0, (spent / budget) * 100)) : 0;
  const overBudget = !isLocked && spent > budget;

  // Jar SVG dimensions
  const JAR_H = 120;
  const LIQUID_MAX_H = 82; // max fill height inside jar body
  const liquidH = (fillPct / 100) * LIQUID_MAX_H;
  const liquidY = 32 + (LIQUID_MAX_H - liquidH); // starts from bottom of jar body

  const liquidColor = overBudget ? "#f08080" : JAR_LIQUID_COLORS[jarKey];
  const lidColor = JAR_LID_COLORS[jarKey];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.35, type: "spring", stiffness: 220 }}
      className={cn(
        "flex flex-col items-center gap-2 cursor-pointer p-3 rounded-2xl border-2 border-border",
        "shadow-[2px_4px_0px_rgba(0,0,0,0.12)] transition-colors",
        isLocked ? "bg-muted/40" : "bg-card hover:bg-muted/20"
      )}
      onClick={onClick}
      data-testid={`pixel-jar-${jarKey}`}
    >
      {/* SVG Jar */}
      <div className="relative">
        <svg
          viewBox={`0 0 80 ${JAR_H}`}
          width={72}
          height={JAR_H}
          style={{ display: "block" }}
        >
          {/* Clip path for liquid */}
          <defs>
            <clipPath id={`clip-${jarKey}`}>
              {/* Jar body interior */}
              <rect x="8" y="32" width="64" height="82" rx="8" />
            </clipPath>
          </defs>

          {/* Jar body outline */}
          <rect
            x="6" y="30"
            width="68" height="84"
            rx="10"
            fill="rgba(255,255,255,0.7)"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="2"
          />

          {/* Liquid fill */}
          <g clipPath={`url(#clip-${jarKey})`}>
            <motion.rect
              x="8"
              width="64"
              height={liquidH}
              rx="0"
              initial={{ y: 32 + LIQUID_MAX_H, height: 0 }}
              animate={{ y: liquidY, height: liquidH }}
              transition={{ duration: 0.9, delay: delay * 0.08 + 0.15, ease: [0.34, 1.2, 0.64, 1] }}
              fill={liquidColor}
            />
            {/* Wave shimmer at top of liquid */}
            {fillPct > 2 && fillPct < 98 && (
              <motion.ellipse
                cx="40"
                cy={liquidY}
                rx="28"
                ry="4"
                fill="rgba(255,255,255,0.35)"
                animate={{ ry: [3, 5, 3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </g>

          {/* Glass reflection */}
          <rect
            x="16" y="38"
            width="8" height="40"
            rx="4"
            fill="rgba(255,255,255,0.3)"
          />

          {/* Lid */}
          <rect
            x="10" y="22"
            width="60" height="14"
            rx="4"
            fill={lidColor}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1.5"
          />
          {/* Lid top ridge */}
          <rect
            x="18" y="18"
            width="44" height="8"
            rx="3"
            fill={lidColor}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="1.5"
          />

          {/* Lock icon on lid for locked jars */}
          {isLocked && (
            <g transform="translate(32, 19)">
              {/* Lock body */}
              <rect x="2" y="5" width="12" height="9" rx="2" fill="rgba(0,0,0,0.5)" />
              {/* Lock shackle */}
              <path
                d="M 4 5 L 4 2 A 4 4 0 0 1 12 2 L 12 5"
                fill="none"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Keyhole */}
              <circle cx="8" cy="9" r="1.5" fill="rgba(255,255,255,0.7)" />
            </g>
          )}

          {/* Jar rim highlight */}
          <rect
            x="8" y="30"
            width="64" height="4"
            rx="2"
            fill="rgba(255,255,255,0.4)"
          />
        </svg>

        {/* Rollover badge */}
        {rollover > 0 && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
            +{fmt(rollover)}
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center text-center w-full">
        <h3 className="font-pixel text-[8px] text-muted-foreground mb-0.5 leading-tight">{label}</h3>
        <p className={cn("font-bold text-base leading-tight", isLocked ? "text-muted-foreground" : "text-foreground")}>
          {fmt(remaining)}
        </p>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          {fmt(spent)} {isLocked ? "saved" : "spent"} / {fmt(budget)}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: overBudget ? "#f08080" : liquidColor }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, fillPct)}%` }}
            transition={{ duration: 0.8, delay: delay * 0.08 + 0.2 }}
          />
        </div>

        {/* Auto-borrow tags */}
        {autoBorrows.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-0.5 w-full">
            {autoBorrows.map((b, i) => (
              <div
                key={i}
                className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-center"
              >
                Borrowed {fmt(b.amount)} from {JAR_LABELS[b.fromJar]}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
