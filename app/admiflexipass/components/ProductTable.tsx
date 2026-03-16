"use client";

import React from "react";
import { Package, Trash2, Edit2, Zap, Layout, Clock } from "lucide-react";

export interface Product {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
  plan?: string;
  duration_days?: number;
  image_url?: string;
  short_description?: string;
  active: boolean;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isLoading: boolean;
}

export default function ProductTable({ products, onEdit, onDelete, isLoading }: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-[#1e1e2e] rounded-3xl border border-zinc-800 p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em]">Syncing Catalog...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1e1e2e] rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/20 border-b border-zinc-800">
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] w-16 text-center">Média</th>
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Titre</th>
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Plan / Type</th>
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Prix</th>
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Statut</th>
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 px-6 text-center text-zinc-500 italic">
                  Aucun produit trouvé dans la base de données.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-all group">
                  <td className="py-5 px-6">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} className="text-zinc-700" />
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-zinc-100 font-bold block">{item.title}</span>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest flex items-center gap-1">
                      <Layout size={10} /> {item.type || "Générique"}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                       <span className="text-zinc-200 font-bold text-sm tracking-tight">{item.plan || "Standard"}</span>
                       {item.duration_days && (
                         <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-medium">
                           <Clock size={10} /> {item.duration_days} Jours
                         </span>
                       )}
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-zinc-100 font-black italic text-lg">
                      {Number(item.price).toLocaleString()} <span className="text-[10px] not-italic text-zinc-500">{item.currency || 'USD'}</span>
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.active 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {item.active ? <Zap size={10} fill="currentColor" /> : <div className="w-2 h-2 rounded-full bg-red-500" />}
                      {item.active ? 'Actif' : 'Hors-ligne'}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-3 relative z-[50]">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Edit requested for:", item.title);
                          onEdit(item);
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl transition-all border border-zinc-700 hover:border-zinc-500 shadow-xl active:scale-90"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                         type="button"
                         onClick={(e) => {
                          e.stopPropagation();
                          console.log("Delete requested for:", item.id);
                          onDelete(item);
                        }}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded-xl transition-all border border-zinc-700 hover:border-red-500/50 shadow-xl active:scale-90"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
