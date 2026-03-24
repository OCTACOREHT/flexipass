"use client";

import React from "react";
import { format } from "date-fns";
import { Eye, ExternalLink } from "lucide-react";

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  total_amount: number;
  status: "pending" | "completed" | "delivered" | "rejected";
  payment_proof_url: string;
  gift_code?: string;
  created_at: string;
  email?: string;
  user_name?: string;
}

interface OrderRowProps {
  order: Order;
  onView: (order: Order) => void;
}

export default function OrderRow({ order, onView }: OrderRowProps) {
  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
      <td className="py-4 px-4">
        <span className="text-zinc-400 text-xs font-mono cursor-help hover:text-zinc-200 transition-colors" title={order.id}>#{order.id.slice(0, 8)}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col max-w-[200px]">
          <span className="text-zinc-200 font-medium truncate" title={order.user_name || "Client"}>{order.user_name || "Client"}</span>
          <span className="text-zinc-500 text-[10px] font-mono truncate" title={order.email || "No Email"}>{order.email || "No Email"}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-zinc-500 text-[10px] font-mono cursor-help hover:text-zinc-300 transition-colors" title={order.user_id}>{order.user_id.slice(0, 8)}...</span>
      </td>
      <td className="py-4 px-4 font-semibold text-zinc-100">${order.total_amount.toFixed(2)}</td>
      <td className="py-4 px-4">
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            order.status === "completed" || order.status === "delivered"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : order.status === "rejected"
              ? "bg-red-500/10 text-red-400 border border-red-500/20"
              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
          }`}
        >
          {order.status === "completed" || order.status === "delivered"
            ? "Terminee"
            : order.status === "rejected"
            ? "Refusee"
            : "En attente"}
        </span>
      </td>
      <td className="py-4 px-4 text-zinc-500 text-xs">
        {format(new Date(order.created_at), "d MMM, HH:mm")}
      </td>
      <td className="py-4 px-4 text-right">
        <button 
          onClick={() => onView(order)}
          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          title="Voir les détails"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
}

