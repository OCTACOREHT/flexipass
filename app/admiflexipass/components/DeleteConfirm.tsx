"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirm({ isOpen, title, message, onClose, onConfirm }: DeleteConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-[#1e1e2e] w-full max-w-md rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4 bg-red-500/5">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-zinc-100">
              {title}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <p className="text-zinc-400 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-[#27293d]/50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 rounded-xl transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95"
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );
}
