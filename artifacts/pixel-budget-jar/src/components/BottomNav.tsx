import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutGrid, PlusCircle, History, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Jars", icon: LayoutGrid },
    { href: "/add", label: "Add", icon: PlusCircle },
    { href: "/history", label: "History", icon: History },
    { href: "/income", label: "Income", icon: Wallet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border pb-safe z-50">
      <div className="flex justify-around items-center p-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-2 min-w-[64px] rounded-xl transition-all cursor-pointer",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-1", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
