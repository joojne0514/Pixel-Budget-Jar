import React from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Trash2, Ghost } from "lucide-react";
import { useMonthData } from "@/hooks/useMonthData";
import { JAR_LABELS } from "@/hooks/useBudget";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Props = {
  monthKey: string;
};

export default function HistoryView({ monthKey }: Props) {
  const { data, deleteTransaction } = useMonthData(monthKey);
  const { toast } = useToast();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const sortedTransactions = [...data.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({
      title: "Transaction deleted",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 pb-24 max-w-lg mx-auto"
    >
      <h2 className="font-pixel text-sm mb-6 text-center tracking-wide text-foreground">Transaction History</h2>

      {sortedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card border-2 border-dashed border-border rounded-2xl">
          <Ghost className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-bold text-sm">No expenses logged yet.</p>
          <p className="text-xs mt-1 opacity-70">Your jars are full and untouched.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTransactions.map((tx, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={tx.id} 
              className="flex items-center justify-between p-4 bg-card border-2 border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    `bg-pastel-${tx.jarKey} text-pastel-${tx.jarKey}`
                  )}>
                    {JAR_LABELS[tx.jarKey]}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {format(parseISO(tx.date), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground truncate">
                  {tx.note || "No note"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-pixel text-xs text-foreground">
                  {formatter.format(tx.amount)}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(tx.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
