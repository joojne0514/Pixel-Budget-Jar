import React from "react";
import { motion } from "framer-motion";
import { useBudget, JAR_ORDER, JAR_LABELS, FOOD_MINIMUM } from "@/hooks/useBudget";
import { JarCard } from "@/components/JarCard";
import { JarKey } from "@/hooks/useMonthData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Props = {
  monthKey: string;
};

const JAR_COLORS: Record<JarKey, string> = {
  food: "#f9c0b0",
  transport: "#b0d4f9",
  daily: "#f0e2a0",
  debt: "#c8c8d4",
  investment: "#b0e8d4",
  savings: "#d4b8e8",
  emotional: "#f9b8d4",
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border-2 border-border rounded-xl p-3 shadow-lg text-xs font-bold">
        <div className="text-foreground mb-1">{label}</div>
        {payload.map((p) => (
          <div key={p.name} className="text-muted-foreground">
            {p.name}: {fmt(p.value)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function JarsView({ monthKey }: Props) {
  const { totalIncome, totalFixed, distributableBalance, jarBudgets, jarSpent, jarRemaining, rollovers, totalRolloverAdded } =
    useBudget(monthKey);

  const totalSpent = Object.values(jarSpent).reduce((s, v) => s + v, 0);

  const chartData = JAR_ORDER.map((key) => ({
    name: JAR_LABELS[key].replace(" ", "\n"),
    shortName: JAR_LABELS[key].split(" ")[0],
    Budget: Math.round(jarBudgets[key]),
    Spent: Math.round(jarSpent[key]),
    jarKey: key,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 pb-24"
    >
      {/* Summary strip */}
      <div className="bg-card border-2 border-border rounded-2xl p-4 mb-5 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center divide-x-2 divide-border">
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wide">Income</div>
            <div className="font-pixel text-xs sm:text-sm mt-1 text-primary" data-testid="summary-income">{fmt(totalIncome)}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wide">Fixed</div>
            <div className="font-pixel text-xs sm:text-sm mt-1 text-destructive" data-testid="summary-fixed">{fmt(totalFixed)}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wide">To Jars</div>
            <div className="font-pixel text-xs sm:text-sm mt-1 text-secondary-foreground" data-testid="summary-to-jars">{fmt(distributableBalance)}</div>
          </div>
        </div>
        {totalRolloverAdded > 0 && (
          <div className="mt-3 text-center text-[10px] font-bold text-green-600 bg-green-50 rounded-xl py-1.5 border border-green-200">
            Includes {fmt(totalRolloverAdded)} rolled over from last month
          </div>
        )}
        {totalIncome > 0 && (
          <div className="mt-2 text-center text-[10px] text-muted-foreground font-semibold">
            Food min: {fmt(FOOD_MINIMUM)} guaranteed
          </div>
        )}
      </div>

      {/* Jar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {JAR_ORDER.map((jarKey, index) => (
          <JarCard
            key={jarKey}
            jarKey={jarKey}
            budget={jarBudgets[jarKey]}
            spent={jarSpent[jarKey]}
            remaining={jarRemaining[jarKey]}
            rollover={rollovers[jarKey] ?? 0}
            delay={index * 0.08}
          />
        ))}
      </div>

      {/* Monthly Summary Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border-2 border-border rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-pixel text-[10px] tracking-wide text-foreground">Monthly Summary</h2>
          <span className="text-[10px] font-bold text-muted-foreground">
            {fmt(totalSpent)} spent total
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground font-semibold mb-4">Budget vs Spent per jar</p>

        {totalIncome === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs font-bold">
            Set your income to see the chart
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2} barCategoryGap="25%">
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 9, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Budget" radius={[4, 4, 0, 0]} opacity={0.5}>
                  {chartData.map((entry) => (
                    <Cell key={entry.jarKey} fill={JAR_COLORS[entry.jarKey as JarKey]} />
                  ))}
                </Bar>
                <Bar dataKey="Spent" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.jarKey} fill={JAR_COLORS[entry.jarKey as JarKey]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-muted-foreground/30" />
            <span className="text-[10px] font-bold text-muted-foreground">Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-foreground/60" />
            <span className="text-[10px] font-bold text-muted-foreground">Spent</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
