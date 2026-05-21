import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useMonthData, JarKey } from "@/hooks/useMonthData";
import { JAR_LABELS } from "@/hooks/useBudget";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const formSchema = z.object({
  date: z.string().nonempty("Date is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  jarKey: z.string().nonempty("Please select a jar"),
  note: z.string().max(50, "Note too long").optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  monthKey: string;
};

export default function AddExpenseView({ monthKey }: Props) {
  const { addTransaction } = useMonthData(monthKey);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "" as unknown as number,
      jarKey: "daily",
      note: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    addTransaction({
      date: new Date(values.date).toISOString(),
      amount: values.amount,
      jarKey: values.jarKey as JarKey,
      note: values.note || "",
    });

    toast({
      title: "Transaction added!",
      description: `Spent $${values.amount} from ${JAR_LABELS[values.jarKey as JarKey]}.`,
    });

    form.reset({
      date: format(new Date(), "yyyy-MM-dd"),
      amount: "" as unknown as number,
      jarKey: "daily",
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
      <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-pixel text-sm mb-6 text-center tracking-wide">Log Expense</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jarKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-muted-foreground">From Jar</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 bg-background border-2 rounded-xl font-bold">
                        <SelectValue placeholder="Select a jar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(JAR_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="font-bold">
                          {label}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-xs uppercase text-muted-foreground">Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="h-14 bg-background border-2 rounded-xl font-bold"
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
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-14 rounded-xl font-pixel text-[10px] mt-4 hover-elevate">
              Save Expense
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
