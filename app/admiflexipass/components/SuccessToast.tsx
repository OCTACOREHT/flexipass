"use client";

import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface SuccessToastProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export default function SuccessToast({ message, type = "success", onClose }: SuccessToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-2xl ${
        type === 'success' 
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
          : 'bg-red-500/10 border-red-500/20 text-red-500'
      }`}>
        {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
        <span className="text-sm font-black italic uppercase tracking-widest">{message}</span>
        <button 
          onClick={onClose}
          className="ml-2 p-1 hover:bg-black/10 rounded-md transition-all"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
