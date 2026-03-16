import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-[#1e1e2e] p-6 rounded-2xl border border-zinc-800 flex items-start justify-between shadow-lg hover:border-zinc-700 transition-colors">
      <div>
        <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-zinc-100">{value}</h3>
        {trend && (
          <p className={`text-xs mt-2 flex items-center ${trendUp ? "text-emerald-500" : "text-red-500"}`}>
            {trend} <span className="text-zinc-500 ml-1">ces 30 derniers jours</span>
          </p>
        )}
      </div>
      <div className="p-3 bg-zinc-800/50 rounded-xl text-red-500 border border-zinc-700">
        <Icon size={24} />
      </div>
    </div>
  );
}
