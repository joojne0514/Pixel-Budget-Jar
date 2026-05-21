import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Star, Gift, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type IncomeJarProps = {
  id: string;
  label: string;
  category: "salary" | "creator" | "gift";
  amount: number;
  onSave: (id: string, amount: number) => void;
};

const ICONS = {
  salary: Briefcase,
  creator: Star,
  gift: Gift,
};

export function IncomeJar({ id, label, category, amount, onSave }: IncomeJarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(amount.toString());
  const [showCoins, setShowCoins] = useState(false);
  
  const Icon = ICONS[category];

  const handleSave = () => {
    const num = Number(editValue);
    if (!isNaN(num)) {
      if (num > amount) {
        setShowCoins(true);
        setTimeout(() => setShowCoins(false), 2000);
      }
      onSave(id, num);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center bg-card border-2 border-border rounded-xl p-3 shadow-[2px_4px_0px_rgba(0,0,0,0.12)] relative">
      {/* Coin Animation */}
      <AnimatePresence>
        {showCoins && (
          <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none z-10">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 0, scale: 0 }}
                animate={{ y: 20, opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600 absolute"
                style={{ left: `calc(50% + ${(i - 2) * 15}px)` }}
              />
            ))}
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -40, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute font-pixel text-xs text-primary top-10"
            >
              +{Number(editValue) - amount}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-16 h-16 relative flex items-center justify-center bg-muted rounded-full border-2 border-border mb-2">
        <Icon className="w-8 h-8 text-foreground" />
      </div>
      
      <h3 className="font-pixel text-[9px] text-muted-foreground mb-2 text-center">{label}</h3>
      
      {isEditing ? (
        <div className="flex items-center gap-1 w-full max-w-[120px]">
          <Input 
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-sm px-2"
            type="number"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            onBlur={handleSave}
          />
        </div>
      ) : (
        <div 
          className="font-bold text-lg cursor-pointer hover:text-primary transition-colors"
          onClick={() => setIsEditing(true)}
        >
          ${amount}
        </div>
      )}
    </div>
  );
}
