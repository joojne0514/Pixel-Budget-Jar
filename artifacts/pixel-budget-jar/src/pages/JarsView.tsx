import { useState } from "react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useMonthData } from "@/hooks/useMonthData";
import { useBudget, JAR_ORDER, JAR_LABELS } from "@/hooks/useBudget";
import { PixelJar } from "@/components/PixelJar";
import { TransferModal } from "@/components/TransferModal";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function JarsView({ monthKey }: { monthKey: string }) {
  const [, setLocation] = useLocation();
  const { data, addTransfer } = useMonthData(monthKey);
  const budgetData = useBudget(monthKey);
  
  const [transferOpen, setTransferOpen] = useState(false);

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
  } = budgetData;

  // Compute auto borrows for display
  const autoBorrowsForJar = (jarKey: string) =>
    data.transfers
      .filter(t => t.auto && t.toJar === jarKey)
      .reduce<Array<{fromJar: string; amount: number}>>((acc, t) => {
        const existing = acc.find(x => x.fromJar === t.fromJar);
        if (existing) existing.amount += t.amount;
        else acc.push({ fromJar: t.fromJar, amount: t.amount });
        return acc;
      }, []);

  // Prepare chart data
  const chartData = JAR_ORDER.map((key) => ({
    name: JAR_LABELS[key].substring(0, 3),
    budget: jarBudgets[key],
    spent: jarSpent[key],
    fill: `hsl(var(--primary))`,
    key,
  }));

  // Define colors for chart to match pastel vibe loosely
  const CHAT_COLORS: Record<string, string> = {
    food: "#ffd6cc",
    transport: "#c5dff8",
    daily: "#fff0b8",
    debt: "#d0d0f0",
    savings: "#e8d4f8",
    emotional: "#ffd6e8"
  };

  return (
    <div className="pb-24 px-4 pt-2 max-w-2xl mx-auto animate-in fade-in duration-300">
      
      {/* Summary Strip */}
      <Card className="mb-6 border-2 border-border shadow-[2px_4px_0px_rgba(0,0,0,0.12)] bg-card">
        <CardContent className="p-4 flex justify-between items-center text-center">
          <div>
            <p className="text-[10px] text-muted-foreground font-pixel mb-1">Income</p>
            <p className="font-bold">${totalIncome.toFixed(0)}</p>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div>
            <p className="text-[10px] text-muted-foreground font-pixel mb-1">Fixed</p>
            <p className="font-bold">${totalFixed.toFixed(0)}</p>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div>
            <p className="text-[10px] text-muted-foreground font-pixel mb-1">Base</p>
            <p className="font-bold text-primary">${baseBalance.toFixed(0)}</p>
          </div>
        </CardContent>
        {totalRolloverAdded > 0 && (
          <div className="bg-muted px-4 py-1 text-center text-[10px] text-muted-foreground border-t-2 border-border">
            Includes ${totalRolloverAdded.toFixed(0)} rollover from last month
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-end mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="font-pixel text-[10px] shadow-sm"
          onClick={() => setTransferOpen(true)}
        >
          <ArrowLeftRight className="w-3 h-3 mr-2" />
          Transfer Money
        </Button>
      </div>

      {/* Jars Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {JAR_ORDER.map((key, i) => {
          const rolloverAmount = (rollovers[key as keyof typeof rollovers] || 0) + 
                                 (lockedContributions[key as keyof typeof lockedContributions] || 0);
          
          return (
            <PixelJar
              key={key}
              jarKey={key}
              label={JAR_LABELS[key]}
              budget={jarBudgets[key] || 0}
              spent={jarSpent[key] || 0}
              remaining={jarRemaining[key] || 0}
              rollover={rolloverAmount}
              autoBorrows={autoBorrowsForJar(key) as any}
              delay={i}
              onClick={() => setLocation("/history")} // or open a specific jar detail
            />
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-card border-2 border-border p-4 rounded-2xl shadow-[2px_4px_0px_rgba(0,0,0,0.12)]">
        <h3 className="font-pixel text-[10px] mb-6 text-center text-muted-foreground">Monthly Overview</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                cursor={{ fill: "hsl(var(--muted)/0.5)" }}
                contentStyle={{ borderRadius: '12px', border: '2px solid hsl(var(--border))', boxShadow: '2px 4px 0px rgba(0,0,0,0.12)' }}
              />
              <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHAT_COLORS[entry.key] || '#ccc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TransferModal 
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        jarBudgets={jarBudgets}
        jarRemaining={jarRemaining}
        onTransfer={addTransfer}
      />
    </div>
  );
}
