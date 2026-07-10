"use client";

import React from "react";
import { format } from "date-fns";
import { Eye } from "lucide-react";

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
    <tr className="border-b border-[#efe5d9]/60 hover:bg-zinc-50 transition-colors group bg-white">
      <td className="py-4 px-4">
        <span className="text-zinc-400 text-xs font-mono cursor-help hover:text-zinc-600 transition-colors" title={order.id}>#{order.id.slice(0, 8)}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex flex-col max-w-[200px]">
          <span className="text-[#2f2a33] font-semibold truncate" title={order.user_name || "Client"}>{order.user_name || "Client"}</span>
          <span className="text-zinc-500 text-[10px] font-mono truncate" title={order.email || "No Email"}>{order.email || "No Email"}</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-zinc-400 text-[10px] font-mono cursor-help hover:text-zinc-600 transition-colors" title={order.user_id}>{order.user_id.slice(0, 8)}...</span>
      </td>
      <td className="py-4 px-4 font-bold text-[#2f2a33]">{order.total_amount.toFixed(2)} HTG</td>
      <td className="py-4 px-4">
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            order.status === "completed" || order.status === "delivered"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : order.status === "rejected"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
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
          className="p-2 text-zinc-400 hover:text-[#ff6a1a] hover:bg-zinc-100 rounded-lg transition-all"
          title="Voir les détails"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
}
