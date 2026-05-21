import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { JarKey, RolloverChoice, UNLOCKED_JAR_KEYS } from "@/hooks/useMonthData";
import { JAR_LABELS } from "@/hooks/useBudget";
import { motion, AnimatePresence } from "framer-motion";

export type RolloverModalProps = {
  open: boolean;
  onClose: () => void;
  jarRemaining: Record<JarKey, number>;
  onConfirm: (choices: Partial<Record<JarKey, RolloverChoice>>) => void;
};

export function RolloverModal({ open, onClose, jarRemaining, onConfirm }: RolloverModalProps) {
  // Initialize choices for unlocked jars with remaining > 0
  const initialChoices: Partial<Record<JarKey, RolloverChoice>> = {};
  UNLOCKED_JAR_KEYS.forEach(jar => {
    if ((jarRemaining[jar] || 0) > 0) {
      initialChoices[jar] = "same";
    }
  });

  const [choices, setChoices] = useState<Partial<Record<JarKey, RolloverChoice>>>(initialChoices);
  const [showConfetti, setShowConfetti] = useState(false);

  const jarsWithBalance = UNLOCKED_JAR_KEYS.filter(jar => (jarRemaining[jar] || 0) > 0);

  const handleConfirm = () => {
    setShowConfetti(true);
    setTimeout(() => {
      onConfirm(choices);
      setShowConfetti(false);
      onClose();
    }, 1500);
  };

  return (
    <Sheet open={open} onOpenChange={(val) => { if (!showConfetti) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl px-6 py-8 max-h-[90vh] overflow-y-auto">
        <AnimatePresence>
          {showConfetti && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <div className="font-pixel text-xl text-primary animate-bounce">Month Closed!</div>
              {/* Fake confetti dots */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-sm bg-primary"
                  initial={{ 
                    x: 0, y: 0, 
                    backgroundColor: ['#ffd6cc', '#c5dff8', '#fff0b8', '#d0d0f0', '#e8d4f8'][i % 5]
                  }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 400, 
                    y: (Math.random() - 0.5) * 400 + 200,
                    opacity: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <SheetHeader className="mb-6">
          <SheetTitle className="font-pixel text-sm">Rollover Leftovers</SheetTitle>
          <SheetDescription>Where should your remaining balance go?</SheetDescription>
        </SheetHeader>

        {jarsWithBalance.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground font-pixel text-xs">
            No leftover balance in unlocked jars.
          </div>
        ) : (
          <div className="space-y-6 mb-6">
            {jarsWithBalance.map((jar) => (
              <div key={jar} className="bg-muted/30 p-4 rounded-xl border border-border">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-pixel text-[10px]">{JAR_LABELS[jar]}</h4>
                  <span className="font-bold text-primary">${(jarRemaining[jar] || 0).toFixed(2)}</span>
                </div>
                
                <RadioGroup 
                  value={choices[jar] || "same"} 
                  onValueChange={(val) => setChoices(prev => ({ ...prev, [jar]: val as RolloverChoice }))}
                  className="gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="same" id={`${jar}-same`} />
                    <Label htmlFor={`${jar}-same`} className="text-xs">Keep in {JAR_LABELS[jar]}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="debt" id={`${jar}-debt`} />
                    <Label htmlFor={`${jar}-debt`} className="text-xs">Move to Debt Repayment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="savings" id={`${jar}-savings`} />
                    <Label htmlFor={`${jar}-savings`} className="text-xs">Move to Savings</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        )}

        <Button 
          className="w-full font-pixel text-xs py-6 shadow-sm" 
          onClick={handleConfirm}
          disabled={showConfetti}
        >
          Confirm & Close Month
        </Button>
      </SheetContent>
    </Sheet>
  );
}
