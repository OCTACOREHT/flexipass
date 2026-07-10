"use client";

import React from "react";
import { CheckCircle2, Clock, List } from "lucide-react";

interface OrderFiltersProps {
  currentFilter: "pending" | "completed" | "all";
  onFilterChange: (filter: "pending" | "completed" | "all") => void;
}

export default function OrderFilters({ currentFilter, onFilterChange }: OrderFiltersProps) {
  const options: Array<{
    id: OrderFiltersProps["currentFilter"];
    label: string;
    icon: typeof Clock;
    activeClass: string;
  }> = [
    { id: "pending", label: "Pending", icon: Clock, activeClass: "bg-[#ff6a1a] text-white" },
    { id: "completed", label: "Completed", icon: CheckCircle2, activeClass: "bg-emerald-600 text-white" },
    { id: "all", label: "All Items", icon: List, activeClass: "bg-[#2f2a33] text-white" }
  ];

  return (
    <div className="flex bg-white p-1.5 rounded-2xl border border-[#efe5d9] shadow-sm overflow-hidden">
      {options.map((option) => {
        const isActive = currentFilter === option.id;
        let activeStyle = {};
        if (isActive) {
          if (option.id === "pending") activeStyle = { backgroundColor: "#ff6a1a", color: "white" };
          else if (option.id === "completed") activeStyle = { backgroundColor: "#059669", color: "white" }; // emerald-600
          else if (option.id === "all") activeStyle = { backgroundColor: "#2f2a33", color: "white" };
        }
        return (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              isActive 
                ? "shadow-sm" 
                : "text-zinc-500 hover:text-[#ff6a1a] hover:bg-zinc-50"
            }`}
            style={activeStyle}
          >
            <option.icon size={14} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
