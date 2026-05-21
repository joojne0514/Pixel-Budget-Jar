import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JarKey, LOCKED_JAR_KEYS, UNLOCKED_JAR_KEYS } from "@/hooks/useMonthData";
import { JAR_LABELS, JAR_ORDER } from "@/hooks/useBudget";

export type TransferModalProps = {
  open: boolean;
  onClose: () => void;
  jarBudgets: Record<JarKey, number>;
  jarRemaining: Record<JarKey, number>;
  onTransfer: (transfer: { fromJar: JarKey; toJar: JarKey; amount: number; note: string; date: string }) => void;
  defaultFromJar?: JarKey;
};

export function TransferModal({ open, onClose, jarBudgets, jarRemaining, onTransfer, defaultFromJar }: TransferModalProps) {
  const [fromJar, setFromJar] = useState<JarKey | "">(defaultFromJar || "");
  const [toJar, setToJar] = useState<JarKey | "">("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleTransfer = () => {
    if (!fromJar || !toJar || !amount) return;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onTransfer({
      fromJar: fromJar as JarKey,
      toJar: toJar as JarKey,
      amount: numAmount,
      note: note || `Transfer to ${JAR_LABELS[toJar as JarKey]}`,
      date: new Date().toISOString(),
    });
    
    setFromJar("");
    setToJar("");
    setAmount("");
    setNote("");
    onClose();
  };

  // Determine valid From Jars (must have balance)
  const validFromJars = JAR_ORDER.filter(key => (jarRemaining[key] || 0) > 0);

  // Determine valid To Jars based on From Jar
  let validToJars: JarKey[] = [];
  if (fromJar) {
    const isLocked = LOCKED_JAR_KEYS.includes(fromJar as any);
    if (isLocked) {
      // Locked can only transfer to other locked
      validToJars = LOCKED_JAR_KEYS.filter(k => k !== fromJar) as JarKey[];
    } else {
      // Unlocked can transfer anywhere except itself
      validToJars = JAR_ORDER.filter(k => k !== fromJar);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl px-6 py-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-pixel text-sm">Transfer Money</SheetTitle>
          <SheetDescription>Move funds between your jars.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>From Jar</Label>
            <Select value={fromJar} onValueChange={(val) => { setFromJar(val as JarKey); setToJar(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select source jar" />
              </SelectTrigger>
              <SelectContent>
                {validFromJars.map(key => (
                  <SelectItem key={key} value={key}>
                    {JAR_LABELS[key]} (${(jarRemaining[key] || 0).toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>To Jar</Label>
            <Select value={toJar} onValueChange={(val) => setToJar(val as JarKey)} disabled={!fromJar}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination jar" />
              </SelectTrigger>
              <SelectContent>
                {validToJars.map(key => (
                  <SelectItem key={key} value={key}>
                    {JAR_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
            />
            {fromJar && (
              <p className="text-xs text-muted-foreground">
                Available: ${(jarRemaining[fromJar as JarKey] || 0).toFixed(2)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Note (Optional)</Label>
            <Input 
              placeholder="Reason for transfer" 
              value={note} 
              onChange={e => setNote(e.target.value)} 
            />
          </div>

          <Button 
            className="w-full font-pixel text-xs py-6 mt-4 shadow-sm" 
            onClick={handleTransfer}
            disabled={!fromJar || !toJar || !amount || Number(amount) <= 0 || Number(amount) > (jarRemaining[fromJar as JarKey] || 0)}
          >
            Confirm Transfer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
