import { useState } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Trash2, Ghost, ArrowRight } from "lucide-react";
import { useMonthData } from "@/hooks/useMonthData";
import { JAR_LABELS } from "@/hooks/useBudget";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Props = {
  monthKey: string;
};

export default function HistoryView({ monthKey }: Props) {
  const { data, deleteTransaction, deleteTransfer } = useMonthData(monthKey);
  const { toast } = useToast();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const sortedTransactions = [...data.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sortedTransfers = [...data.transfers].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDeleteTx = (id: string) => {
    deleteTransaction(id);
    toast({ title: "Transaction deleted" });
  };

  const handleDeleteTransfer = (id: string) => {
    deleteTransfer(id);
    toast({ title: "Transfer deleted" });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 pb-24 max-w-lg mx-auto"
    >
      <h2 className="font-pixel text-sm mb-6 text-center tracking-wide text-foreground">History</h2>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/50 border-2 border-border shadow-[2px_4px_0px_rgba(0,0,0,0.12)]">
          <TabsTrigger value="expenses" className="font-pixel text-[10px]">Expenses</TabsTrigger>
          <TabsTrigger value="transfers" className="font-pixel text-[10px]">Transfers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="mt-0">
          {sortedTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card border-2 border-dashed border-border rounded-2xl">
              <Ghost className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-bold text-sm">No expenses logged.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map((tx, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={tx.id} 
                  className="flex items-center justify-between p-4 bg-card border-2 border-border rounded-xl shadow-[2px_4px_0px_rgba(0,0,0,0.12)]"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-border/20",
                        `bg-pastel-${tx.jarKey} text-pastel-${tx.jarKey}`
                      )}>
                        {JAR_LABELS[tx.jarKey]}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {format(parseISO(tx.date), "MMM d")}
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
                      onClick={() => handleDeleteTx(tx.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transfers" className="mt-0">
          {sortedTransfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card border-2 border-dashed border-border rounded-2xl">
              <Ghost className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-bold text-sm">No transfers made.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTransfers.map((tx, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={tx.id} 
                  className={cn(
                    "flex flex-col p-4 border-2 border-border rounded-xl shadow-[2px_4px_0px_rgba(0,0,0,0.12)] relative",
                    tx.auto ? "bg-muted/30" : "bg-card"
                  )}
                >
                  {tx.auto && (
                    <span className="absolute -top-2 left-4 bg-muted-foreground text-card text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Auto-Covered
                    </span>
                  )}
                  
                  <div className="flex justify-between items-start w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 pt-1">
                        <span className="font-pixel text-[9px] text-foreground">{JAR_LABELS[tx.fromJar]}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-pixel text-[9px] text-foreground">{JAR_LABELS[tx.toJar]}</span>
                      </div>
                      <p className={cn("text-xs font-bold", tx.auto ? "text-muted-foreground" : "text-foreground")}>
                        {tx.note || "No note"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                        {format(parseISO(tx.date), "MMM d, h:mm a")}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-pixel text-xs text-foreground">
                        {formatter.format(tx.amount)}
                      </span>
                      {!tx.auto && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteTransfer(tx.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {tx.auto && <div className="w-8" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
