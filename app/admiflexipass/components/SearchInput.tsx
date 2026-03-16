"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder }: SearchInputProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full bg-[#1e1e2e] border border-zinc-800 rounded-[1.5rem] pl-14 pr-5 py-4 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all font-medium"
        placeholder={placeholder || "Rechercher des données..."}
      />
    </div>
  );
}
