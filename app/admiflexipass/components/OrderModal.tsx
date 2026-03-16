"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Order } from "./OrderRow";
import { format } from "date-fns";

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({ order, isOpen, onClose, onSuccess }: OrderModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [giftCode, setGiftCode] = useState("");

  const generateGiftCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "FLEX-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGiftCode(code);
  };

  useEffect(() => {
    if (isOpen) {
      setGiftCode("");
      if (order?.status === 'pending') {
        generateGiftCode();
      } else if (order?.gift_code) {
        setGiftCode(order.gift_code);
      }
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const handleApprove = async () => {
    if (!giftCode.trim()) {
      alert("Veuillez fournir un Code Cadeau avant d'approuver.");
      return;
    }
    setIsApproving(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: "completed",
          gift_code: giftCode.trim() 
        })
        .eq("id", order.id);

      if (error) throw error;
      
      // ENVOI DE L'EMAIL DE CONFIRMATION
      try {
        await fetch("/api/email/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: (order as any).email || (order as any).customer_email,
            orderId: order.id,
            giftCode: giftCode.trim(),
            userName: (order as any).user_name,
            amount: order.total_amount
          })
        });
      } catch (emailErr) {
        console.warn("Échec de l'envoi de l'email, mais la commande est approuvée:", emailErr);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur lors de l'approbation de la commande:", err);
      const errorMsg = err.message || JSON.stringify(err);
      alert(`Échec de l'approbation : ${errorMsg}`);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-[#1e1e2e] w-full max-w-2xl rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#27293d]/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              Détails de la Commande <span className="text-zinc-500 text-sm font-mono">#{order.id.slice(0, 8)}</span>
            </h2>
            <p className="text-zinc-500 text-xs">Passée le {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm")}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-200 transition-colors bg-zinc-800/50 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Client</p>
              <p className="text-zinc-200 font-medium">{(order as any).user_name || "Client"} - <span className="text-zinc-500 font-mono text-[10px]">{(order as any).email || (order as any).customer_email || order.user_id}</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Montant de la Commande</p>
              <p className="text-2xl font-bold text-zinc-100">${Number(order.total_amount).toFixed(2)}</p>
            </div>
          </div>

          {/* Gift Code Handling */}
          <div className="space-y-2 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500">
                <ShieldCheck size={18} />
                <p className="text-[10px] uppercase font-black tracking-widest">
                  {order.status === 'pending' ? 'Étape d\'Approbation Finale' : 'Code Cadeau Délivré'}
                </p>
              </div>
              {order.status === 'pending' && (
                <button 
                  onClick={generateGiftCode}
                  className="text-[10px] font-black uppercase text-zinc-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw size={10} /> Régénérer
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                placeholder="Entrez le Code Cadeau..." 
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value)}
                readOnly={order.status === 'completed'}
                className={`flex-1 bg-[#0f0f23] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-red-500/50 outline-none transition-all placeholder:text-zinc-700 font-mono text-lg ${
                  order.status === 'completed' ? 'text-emerald-400 border-emerald-500/20' : ''
                }`}
              />
              {order.status === 'completed' && (
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <CheckCircle size={24} />
                </div>
              )}
            </div>
            {order.status === 'pending' && (
              <p className="text-zinc-600 text-[9px] italic">L'utilisateur recevra ce code sur son tableau de bord instantanément.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Preuve de Paiement</p>
              <a 
                href={order.payment_proof_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-red-500 text-xs flex items-center gap-1 hover:underline"
              >
                Ouvrir dans un nouvel onglet <ExternalLink size={12} />
              </a>
            </div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 group">
              <img 
                src={order.payment_proof_url} 
                alt="Preuve de Paiement" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-[#27293d]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            <span className="text-xs text-zinc-400 capitalize">{order.status === 'completed' ? 'Terminée' : 'En attente'}</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-zinc-400 font-medium hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-700"
            >
              Fermer
            </button>
            {order.status === 'pending' && (
              <button 
                onClick={handleApprove}
                disabled={isApproving}
                className="px-8 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                {isApproving ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <ShieldCheck size={20} />
                )}
                Approuver & Délivrer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
