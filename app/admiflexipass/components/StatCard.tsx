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
    <div className="bg-white p-4 rounded-[1.25rem] border border-[#efe5d9] flex items-start justify-between shadow-sm hover:shadow-md hover:border-[#ff8a00]/30 transition-all duration-300 group min-h-[100px] h-full">
      <div>
        <p className="text-zinc-500 text-xs font-medium mb-1">{title}</p>
        <h3 className="text-xl font-bold text-[#2f2a33]">{value}</h3>
        {trend && (
          <p className={`text-[10px] mt-1.5 ${trendUp ? "text-emerald-600" : "text-[#ff6a1a]"}`}>
            {trend} <span className="text-zinc-400 block mt-0.5">ces 30 derniers jours</span>
          </p>
        )}
      </div>
      <div className="p-2.5 bg-zinc-50 rounded-xl text-[#ff6a1a] border border-zinc-100 group-hover:bg-[#ff8a00]/5 group-hover:scale-110 transition-all duration-300 shrink-0">
        <Icon size={20} />
      </div>
    </div>
  );
}
