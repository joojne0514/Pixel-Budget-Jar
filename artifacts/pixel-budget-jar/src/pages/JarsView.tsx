import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useMonthData } from "@/hooks/useMonthData";
import { useBudget, JAR_ORDER, JAR_LABELS } from "@/hooks/useBudget";
import { BudgetCard } from "@/components/BudgetCard";
import { TransferModal } from "@/components/TransferModal";
import { JarKey } from "@/hooks/useMonthData";

const CHART_COLORS: Record<string, string> = {
  food:      "#F4956A",
  transport: "#5B9CE6",
  daily:     "#E6C830",
  debt:      "#8B68E0",
  savings:   "#40B090",
  emotional: "#E86090",
};

export default function JarsView({ monthKey }: { monthKey: string }) {
  const { data, addTransfer } = useMonthData(monthKey);
  const {
    totalIncome,
    totalFixed,
    baseBalance,
    jarBudgets,
    jarSpent,
    jarRemaining,
    rollovers,
    lockedContributions,
    totalRolloverAdded,
  } = useBudget(monthKey);

  const [transferOpen, setTransferOpen] = useState(false);
  const [defaultFromJar, setDefaultFromJar] = useState<JarKey | undefined>(undefined);

  const autoBorrowsForJar = (jarKey: JarKey) =>
    data.transfers
      .filter((t) => t.auto && t.toJar === jarKey)
      .reduce<Array<{ fromJar: JarKey; amount: number }>>((acc, t) => {
        const existing = acc.find((x) => x.fromJar === t.fromJar);
        if (existing) existing.amount += t.amount;
        else acc.push({ fromJar: t.fromJar, amount: t.amount });
        return acc;
      }, []);

  const chartData = JAR_ORDER.map((key) => ({
    name: JAR_LABELS[key].split(" ")[0],
    budget: Math.round(jarBudgets[key]),
    spent: Math.round(jarSpent[key]),
    key,
  }));

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="pb-28 px-4 pt-3 max-w-2xl mx-auto">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[#F0FBF8] border border-[#B8E8DC] rounded-2xl p-3 text-center shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Income</p>
          <p className="text-base font-bold text-gray-800">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-[#FFF6F0] border border-[#F4D0C0] rounded-2xl p-3 text-center shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Fixed</p>
          <p className="text-base font-bold text-gray-800">{fmt(totalFixed)}</p>
        </div>
        <div className="bg-[#F5F0FF] border border-[#DCD0F5] rounded-2xl p-3 text-center shadow-sm">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Base</p>
          <p className="text-base font-bold text-gray-800">{fmt(baseBalance)}</p>
        </div>
      </div>

      {totalRolloverAdded > 0 && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-[11px] text-emerald-700 font-semibold text-center">
          Includes {fmt(totalRolloverAdded)} rolled over from last month
        </div>
      )}

      {/* Budget cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {JAR_ORDER.map((key, i) => {
          const rolloverAmount =
            (rollovers[key as keyof typeof rollovers] ?? 0) +
            (lockedContributions[key as keyof typeof lockedContributions] ?? 0);
          return (
            <BudgetCard
              key={key}
              jarKey={key}
              budget={jarBudgets[key] ?? 0}
              spent={jarSpent[key] ?? 0}
              remaining={jarRemaining[key] ?? 0}
              rollover={rolloverAmount}
              autoBorrows={autoBorrowsForJar(key)}
              delay={i}
              onTransferClick={() => {
                setDefaultFromJar(key);
                setTransferOpen(true);
              }}
            />
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Monthly Overview</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="budget" name="Budget" radius={[4, 4, 0, 0]} opacity={0.3}>
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={CHART_COLORS[entry.key]} />
                ))}
              </Bar>
              <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={CHART_COLORS[entry.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TransferModal
        open={transferOpen}
        onClose={() => { setTransferOpen(false); setDefaultFromJar(undefined); }}
        jarBudgets={jarBudgets}
        jarRemaining={jarRemaining}
        onTransfer={addTransfer}
        defaultFromJar={defaultFromJar}
      />
    </div>
  );
}
