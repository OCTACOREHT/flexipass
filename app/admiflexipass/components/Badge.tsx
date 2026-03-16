import React from "react";

interface BadgeProps {
  count: number;
  variant?: "danger" | "warning" | "success" | "info";
}

export default function Badge({ count, variant = "danger" }: BadgeProps) {
  const variants = {
    danger: "bg-red-500 text-white",
    warning: "bg-amber-500 text-black",
    success: "bg-emerald-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold shadow-sm ${variants[variant]}`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
