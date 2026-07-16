"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-md rounded-[2rem] border border-[#efe5d9] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-[#efe5d9] flex items-center gap-4 bg-red-50">
          <div className="p-3 bg-red-100/50 rounded-xl text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#2f2a33]">
              {title}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <p className="text-zinc-500 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="p-6 border-t border-[#efe5d9] bg-white flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 font-bold uppercase tracking-wider text-xs hover:bg-zinc-100 rounded-xl transition-all"
            style={{ backgroundColor: '#ffffff', color: '#52525b', border: '1px solid #efe5d9' }}
          >
            Annuler
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 hover:bg-red-500 font-bold uppercase tracking-wider text-xs rounded-xl shadow-md shadow-red-500/10 transition-all active:scale-95"
            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );
}
