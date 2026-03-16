"use client";

import React, { useState, useEffect } from "react";
import { X, Save, PackagePlus, DollarSign, Tag, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/app/admiflexipass/components/ProductTable";
import ImageUploader from "@/app/admiflexipass/components/ImageUploader";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => Promise<void>;
}

export default function ProductModal({ product, isOpen, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<any>({
    title: "",
    price: "",
    currency: "USD",
    plan: "",
    duration_days: "",
    image_url: "",
    short_description: "",
    active: true,
    type: "account"
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          title: product.title || "",
          price: product.price?.toString() || "",
          currency: product.currency || "USD",
          plan: product.plan || "",
          duration_days: product.duration_days?.toString() || "",
          image_url: product.image_url || "",
          short_description: product.short_description || "",
          active: product.active ?? true,
          type: product.type || "account"
        });
      } else {
        setFormData({
          title: "",
          price: "",
          currency: "USD",
          plan: "",
          duration_days: "",
          image_url: "",
          short_description: "",
          active: true,
          type: "account"
        });
      }
      setShowConfirm(false);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    
    setIsSaving(true);
    const submitData = {
      title: formData.title,
      price: parseFloat(formData.price) || 0,
      currency: formData.currency,
      plan: formData.plan,
      duration_days: parseInt(formData.duration_days) || 0,
      image_url: formData.image_url,
      short_description: formData.short_description,
      active: formData.active,
      type: formData.type || "account"
    };

    try {
      if (product?.id) {
        const { error } = await supabase.from("products").update(submitData).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([submitData]);
        if (error) throw error;
      }
      await onSave(submitData);
      onClose();
    } catch (err: any) {
      alert(err.message || "Erreur de synchronisation");
    } finally {
      setIsSaving(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      <div className="relative bg-[#0d0d12] w-full max-w-4xl rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-zinc-900 flex items-center justify-between text-zinc-100 bg-[#16161e]/50">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${product ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {product ? <Save size={28} /> : <PackagePlus size={28} />}
            </div>
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                {product ? "Modifier Produit" : "Nouvel Inventaire"}
              </h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Système de Gestion SKU</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-zinc-500 hover:text-white bg-zinc-900 rounded-full transition-all border border-zinc-800">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Titre</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type="text"
                  required
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#16161e] border border-zinc-800 rounded-2xl pl-12 pr-5 py-5 text-zinc-100 focus:border-red-500/50 outline-none transition-all font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description Courte</label>
              <textarea
                rows={4}
                value={formData.short_description || ""}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full bg-[#16161e] border border-zinc-800 rounded-2xl p-6 text-zinc-300 focus:border-red-500/50 outline-none transition-all resize-none"
              />
            </div>
            <ImageUploader currentImageUrl={formData.image_url || ""} onUpload={(url) => setFormData({ ...formData, image_url: url })} />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Prix</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#16161e] border border-zinc-800 rounded-2xl pl-12 pr-5 py-5 text-zinc-100 focus:border-red-500/50 outline-none transition-all font-mono text-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Devise</label>
                <select
                  value={formData.currency || "USD"}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-[#16161e] border border-zinc-800 rounded-2xl px-6 py-5 text-zinc-100 focus:border-red-500/50 outline-none transition-all cursor-pointer font-bold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="HTG">HTG (G)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Type de Produit</label>
                <select
                  value={formData.type || "account"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-[#16161e] border border-zinc-800 rounded-2xl px-6 py-5 text-zinc-100 focus:border-red-500/50 outline-none transition-all cursor-pointer font-bold"
                >
                  <option value="account">Compte (Streaming/Premium)</option>
                  <option value="giftcard">Carte Cadeau (V-Bucks/PSN/Steam)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Plan / Valeur</label>
                <input
                  type="text"
                  placeholder="Ex: Premium 4K ou $20"
                  value={formData.plan || ""}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full bg-[#16161e] border border-zinc-800 rounded-2xl px-6 py-5 text-zinc-100 focus:border-red-500/50 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Durée (Jours - Pour Comptes)</label>
                <input
                  type="number"
                  value={formData.duration_days || ""}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  className="w-full bg-[#16161e] border border-zinc-800 rounded-2xl px-6 py-5 text-zinc-100 focus:border-red-500/50 outline-none transition-all font-mono"
                  placeholder="Ex: 30 (Laissez vide pour Carte Cadeau)"
                />
            </div>

            <div className="pt-10 border-t border-zinc-900">
               {showConfirm ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                       <AlertCircle size={20} />
                       <span className="text-sm font-bold">Confirmer les modifications ?</span>
                    </div>
                    <div className="flex gap-3">
                       <button type="button" onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-800 transition-all">Annuler</button>
                       <button type="submit" disabled={isSaving} className="flex-1 py-4 bg-emerald-600 text-white font-black italic uppercase rounded-2xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all">{isSaving ? "Sync..." : "Confirmer"}</button>
                    </div>
                 </div>
               ) : (
                <button
                  type="submit"
                  className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-red-600/20 flex items-center justify-center gap-4 transition-all active:scale-95"
                >
                  <Check size={24} />
                  {product ? "Synchroniser" : "Enregistrer SKU"}
                </button>
               )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
