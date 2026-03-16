"use client";

import React from "react";
import OrderRow, { Order } from "./OrderRow";

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  isLoading?: boolean;
}

export default function OrderTable({ orders, onView, isLoading }: OrderTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-[#1e1e2e] rounded-2xl border border-zinc-800 p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 animate-pulse">Récupération des commandes...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1e1e2e] rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/20 border-b border-zinc-800">
              <th className="py-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">ID</th>
              <th className="py-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Client / Email</th>
              <th className="py-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">ID Client</th>
              <th className="py-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Montant</th>
              <th className="py-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Statut</th>
              <th className="py-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Date</th>
              <th className="py-4 px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 px-4 text-center text-zinc-500 italic">
                  Aucune commande trouvée.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <OrderRow key={order.id} order={order} onView={onView} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
