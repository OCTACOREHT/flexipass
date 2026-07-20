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
    currency: "HTG",
    plan: "",
    duration_days: "",
    image_url: "",
    short_description: "",
    description: "",
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
          currency: product.currency || "HTG",
          plan: product.plan || "",
          duration_days: product.duration_days?.toString() || "",
          image_url: product.image_url || "",
          short_description: product.short_description || "",
          description: product.description || "",
          active: product.active ?? true,
          type: product.type || "account"
        });
      } else {
        setFormData({
          title: "",
          price: "",
          currency: "HTG",
          plan: "",
          duration_days: "",
          image_url: "",
          short_description: "",
          description: "",
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
      description: formData.description,
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] border border-[#efe5d9] overflow-hidden animate-in fade-in zoom-in duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8 border-b border-[#efe5d9] flex items-center justify-between text-[#2f2a33] bg-white">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 text-[#ff6a1a] border border-zinc-100">
              {product ? <Save size={28} /> : <PackagePlus size={28} />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#2f2a33]">
                {product ? "Modifier Produit" : "Nouvel Inventaire"}
              </h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">Système de Gestion SKU</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-[#ff6a1a] hover:bg-zinc-100 bg-white rounded-full transition-all border border-[#efe5d9]">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
          {/* Top part: 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Column 1: Media */}
            <div className="space-y-6">
              <ImageUploader currentImageUrl={formData.image_url || ""} onUpload={(url) => setFormData({ ...formData, image_url: url })} />
            </div>

            {/* Column 2: Basic Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Titre</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white border border-[#e7e1d8] rounded-2xl pl-12 pr-5 py-3.5 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Description Courte</label>
                <textarea
                  rows={5}
                  value={formData.short_description || ""}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full bg-white border border-[#e7e1d8] rounded-2xl p-4 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all resize-none"
                />
              </div>
            </div>

            {/* Column 3: Pricing & Plan */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Prix</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white border border-[#e7e1d8] rounded-2xl pl-12 pr-5 py-3.5 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Devise</label>
                <select
                  value={formData.currency || "HTG"}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-white border border-[#e7e1d8] rounded-2xl px-5 py-3.5 text-[#2f2a33] focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all cursor-pointer font-semibold"
                >
                  <option value="HTG">HTG (G)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Plan / Valeur</label>
                <input
                  type="text"
                  placeholder="Ex: Premium 4K ou $20"
                  value={formData.plan || ""}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full bg-white border border-[#e7e1d8] rounded-2xl px-5 py-3.5 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Bottom part: Type, Duration & Centered Submit in 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Type de Produit</label>
              <select
                value={formData.type || "account"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white border border-[#e7e1d8] rounded-2xl px-5 py-3.5 text-[#2f2a33] focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all cursor-pointer font-semibold"
              >
                <option value="account">Compte / Abonnement</option>
                <option value="giftcard">Carte Cadeau (Giftcard)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Durée (Jours)</label>
              <input
                type="number"
                value={formData.duration_days || ""}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                className="w-full bg-white border border-[#e7e1d8] rounded-2xl px-5 py-3.5 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all font-mono"
                placeholder="Ex: 30 (Laissez vide pour Carte Cadeau)"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Description Longue</label>
            <textarea
              rows={4}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border border-[#e7e1d8] rounded-2xl p-4 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all resize-y"
              placeholder="Ex: Saisissez la description complète et longue du produit..."
            />
          </div>
        </div>
        
        {/* Fixed Footer */}
        <div className="p-6 border-t border-[#efe5d9] bg-zinc-50 flex justify-end">
           {showConfirm ? (
             <div className="flex items-center gap-4 w-full">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                   <AlertCircle size={16} />
                   <span className="text-xs font-bold">Confirmer ?</span>
                </div>
                <div className="flex gap-2 ml-auto w-full max-w-sm">
                   <button type="button" onClick={() => setShowConfirm(false)} className="flex-1 py-3.5 text-xs font-bold rounded-xl hover:bg-zinc-50 hover:text-zinc-800 transition-all" style={{ backgroundColor: '#ffffff', color: '#52525b', border: '1px solid #efe5d9' }}>Annuler</button>
                   <button type="submit" disabled={isSaving} className="flex-1 py-3.5 text-xs font-bold uppercase rounded-xl hover:bg-emerald-500 transition-all" style={{ backgroundColor: '#059669', color: '#ffffff' }}>{isSaving ? "Enregistrement..." : "Confirmer"}</button>
                </div>
             </div>
           ) : (
            <div className="flex gap-4 ml-auto w-full max-w-xs">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 hover:bg-zinc-50 font-bold uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center transition-all"
                style={{ backgroundColor: '#ffffff', color: '#52525b', border: '1px solid #efe5d9' }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 hover:bg-[#ff5a00] font-bold uppercase tracking-wider text-xs rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ backgroundColor: '#ff6a1a', color: '#ffffff' }}
              >
                <Check size={18} />
                Enregistrer
              </button>
            </div>
           )}
        </div>
      </form>
    </div>
  </div>
);
}
