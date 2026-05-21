import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { format } from "date-fns";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { MonthSelector } from "@/components/MonthSelector";
import { BottomNav } from "@/components/BottomNav";

import JarsView from "@/pages/JarsView";
import AddExpenseView from "@/pages/AddExpenseView";
import HistoryView from "@/pages/HistoryView";
import IncomeFixedView from "@/pages/IncomeFixedView";

const queryClient = new QueryClient();

function AppContent() {
  const [monthKey, setMonthKey] = useState(() => format(new Date(), "yyyy-MM"));

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col max-w-2xl mx-auto border-x-2 border-border/50 relative shadow-2xl">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-2">
        <MonthSelector currentMonthKey={monthKey} onMonthChange={setMonthKey} />
      </header>

      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/">
            <JarsView monthKey={monthKey} />
          </Route>
          <Route path="/add">
            <AddExpenseView monthKey={monthKey} />
          </Route>
          <Route path="/history">
            <HistoryView monthKey={monthKey} />
          </Route>
          <Route path="/income">
            <IncomeFixedView monthKey={monthKey} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>

      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppContent />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
