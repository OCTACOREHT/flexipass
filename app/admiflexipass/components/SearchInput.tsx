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
        <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-[#ff8a00] transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full bg-white border border-[#efe5d9] rounded-[1.5rem] pl-14 pr-5 py-3.5 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all font-semibold"
        placeholder={placeholder || "Rechercher des données..."}
      />
    </div>
  );
}
