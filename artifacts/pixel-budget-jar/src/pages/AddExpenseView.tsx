import { useMemo } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useMonthData, JarKey, LOCKED_JAR_KEYS } from "@/hooks/useMonthData";
import { useBudget, JAR_LABELS, JAR_ORDER, computeAutoCoverage } from "@/hooks/useBudget";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { AlertTriangle, ArrowDownCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  date: z.string().nonempty("Date is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  jarKey: z.string().nonempty("Please select a jar"),
  note: z.string().max(80, "Note too long").optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  monthKey: string;
};

export default function AddExpenseView({ monthKey }: Props) {
  const { addExpense } = useMonthData(monthKey);
  const { jarRemaining, jarBudgets } = useBudget(monthKey);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "" as unknown as number,
      jarKey: "food",
      note: "",
    },
  });

  const watchedJar = form.watch("jarKey") as JarKey;
  const watchedAmount = form.watch("amount");

  const isLocked = LOCKED_JAR_KEYS.includes(watchedJar as any);

  const preview = useMemo(() => {
    const amount = Number(watchedAmount);
    if (!watchedJar || !amount || amount <= 0) return null;

    if (isLocked) {
      return { type: "deposit" as const, amount };
    }

    const remaining = jarRemaining[watchedJar] ?? 0;
    if (amount <= remaining) {
      return { type: "ok" as const, remaining: remaining - amount };
    }

    const coverage = computeAutoCoverage(watchedJar, amount, jarRemaining);
    const totalCovered = coverage.reduce((s, t) => s + t.amount, 0);
    const uncovered = amount - (remaining < 0 ? 0 : remaining) - totalCovered;

    return {
      type: "overspend" as const,
      deficit: amount - (remaining < 0 ? 0 : remaining),
      coverage,
      totalCovered,
      uncovered: Math.max(0, uncovered),
    };
  }, [watchedJar, watchedAmount, jarRemaining, isLocked]);

  const onSubmit = (values: FormValues) => {
    const autoTransfers =
      preview?.type === "overspend"
        ? preview.coverage.map((c) => ({
            fromJar: c.fromJar,
            toJar: values.jarKey as JarKey,
            amount: c.amount,
            note: c.note,
            date: new Date().toISOString(),
            auto: true as const,
          }))
        : [];

    addExpense(
      {
        date: new Date(values.date).toISOString(),
        amount: values.amount,
        jarKey: values.jarKey as JarKey,
        note: values.note || "",
      },
      autoTransfers
    );

    const label = JAR_LABELS[values.jarKey as JarKey];
    toast({
      title: isLocked ? "Deposit recorded!" : "Expense logged!",
      description: `$${values.amount} → ${label}`,
    });

    form.reset({
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "" as unknown as number,
      jarKey: "food",
      note: "",
    });

    setLocation("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 pb-24 max-w-md mx-auto"
    >
      <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-[2px_4px_0px_rgba(0,0,0,0.12)]">
        <h2 className="font-pixel text-sm mb-6 text-center tracking-wide">Log Expense</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Jar selector first so preview is meaningful */}
            <FormField
              control={form.control}
              name="jarKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-muted-foreground">
                    {isLocked ? "Deposit Into" : "From Jar"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 bg-background border-2 rounded-xl font-bold" data-testid="select-jar">
                        <SelectValue placeholder="Select a jar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {JAR_ORDER.map((key) => (
                        <SelectItem key={key} value={key} className="font-bold">
                          {JAR_LABELS[key]}
                          {LOCKED_JAR_KEYS.includes(key as any) ? " (locked)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-muted-foreground">Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-pixel text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8 font-pixel text-lg h-14 bg-background border-2 rounded-xl"
                        data-testid="input-amount"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview panel */}
            {preview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={cn(
                  "rounded-xl border-2 p-3 text-xs font-semibold space-y-1",
                  preview.type === "ok" && "border-green-200 bg-green-50 text-green-800",
                  preview.type === "deposit" && "border-blue-200 bg-blue-50 text-blue-800",
                  preview.type === "overspend" && "border-amber-200 bg-amber-50 text-amber-800"
                )}
              >
                {preview.type === "ok" && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Remaining after: ${preview.remaining.toFixed(2)}</span>
                  </div>
                )}
                {preview.type === "deposit" && (
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4 shrink-0" />
                    <span>Deposit into {JAR_LABELS[watchedJar]} (locked jar)</span>
                  </div>
                )}
                {preview.type === "overspend" && (
                  <>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Over budget by ${preview.deficit.toFixed(2)}</span>
                    </div>
                    {preview.coverage.length > 0 && (
                      <div className="pl-6 space-y-0.5">
                        {preview.coverage.map((c, i) => (
                          <div key={i} className="text-amber-700">
                            Borrow ${c.amount.toFixed(2)} from {JAR_LABELS[c.fromJar]}
                          </div>
                        ))}
                      </div>
                    )}
                    {preview.uncovered > 0 && (
                      <div className="flex items-center gap-2 text-destructive font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>${preview.uncovered.toFixed(2)} cannot be covered — insufficient funds</span>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-muted-foreground">Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="h-14 bg-background border-2 rounded-xl font-bold"
                      data-testid="input-date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-muted-foreground">Note (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What was this for?"
                      className="h-14 bg-background border-2 rounded-xl font-bold"
                      data-testid="input-note"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-14 rounded-xl font-pixel text-[10px] mt-4 hover-elevate shadow-[2px_4px_0px_rgba(0,0,0,0.1)]"
              data-testid="button-submit-expense"
            >
              {isLocked ? "Record Deposit" : "Save Expense"}
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
