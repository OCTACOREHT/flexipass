"use client";

import React from "react";
import { Filter, CheckCircle2, Clock, List } from "lucide-react";

interface OrderFiltersProps {
  currentFilter: "pending" | "completed" | "all";
  onFilterChange: (filter: "pending" | "completed" | "all") => void;
}

export default function OrderFilters({ currentFilter, onFilterChange }: OrderFiltersProps) {
  const options = [
    { id: "pending", label: "Pending", icon: Clock, activeClass: "bg-red-500 text-white shadow-red-500/20" },
    { id: "completed", label: "Completed", icon: CheckCircle2, activeClass: "bg-emerald-500 text-white shadow-emerald-500/20" },
    { id: "all", label: "All Items", icon: List, activeClass: "bg-zinc-700 text-white" }
  ];

  return (
    <div className="flex bg-[#1e1e2e] p-1.5 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onFilterChange(option.id as any)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            currentFilter === option.id 
              ? `${option.activeClass} shadow-lg scale-[1.02]` 
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
          }`}
        >
          <option.icon size={14} />
          {option.label}
        </button>
      ))}
    </div>
  );
}
