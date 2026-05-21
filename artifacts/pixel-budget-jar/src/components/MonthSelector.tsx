import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, parse } from "date-fns";

type Props = {
  currentMonthKey: string;
  onMonthChange: (newMonthKey: string) => void;
};

export function MonthSelector({ currentMonthKey, onMonthChange }: Props) {
  // monthKey format: YYYY-MM
  const currentDate = parse(currentMonthKey, "yyyy-MM", new Date());

  const handlePrev = () => {
    onMonthChange(format(subMonths(currentDate, 1), "yyyy-MM"));
  };

  const handleNext = () => {
    onMonthChange(format(addMonths(currentDate, 1), "yyyy-MM"));
  };

  return (
    <div className="flex items-center justify-between p-4 bg-card shadow-sm rounded-xl mb-6 mx-4 border-2 border-border mt-4">
      <button 
        onClick={handlePrev}
        className="p-2 hover:bg-muted rounded-full transition-colors"
        aria-label="Previous Month"
      >
        <ChevronLeft className="w-6 h-6 text-foreground" />
      </button>
      
      <h2 className="text-[10px] sm:text-xs font-pixel text-foreground uppercase tracking-widest text-center">
        {format(currentDate, "MMMM yyyy")}
      </h2>

      <button 
        onClick={handleNext}
        className="p-2 hover:bg-muted rounded-full transition-colors"
        aria-label="Next Month"
      >
        <ChevronRight className="w-6 h-6 text-foreground" />
      </button>
    </div>
  );
}
