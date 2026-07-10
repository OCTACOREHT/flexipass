"use client";

import React, { useState, useEffect } from "react";
import { X, Save, UserPlus, Shield, User as UserIcon } from "lucide-react";
import { DashboardUser } from "./UserTable";

interface UserModalProps {
  user: DashboardUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<DashboardUser>) => Promise<void>;
}

export default function UserModal({ user, isOpen, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client" as "admin" | "client",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "client",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "client",
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
      alert("Erreur lors de l'enregistrement de l'utilisateur");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] border border-[#efe5d9] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-[#efe5d9] flex items-center justify-between text-[#2f2a33] bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-50 rounded-xl text-[#ff6a1a] border border-zinc-100">
              {user ? <Save size={24} /> : <UserPlus size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#2f2a33]">
                {user ? "Modifier Membre" : "Nouveau Membre"}
              </h2>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mt-0.5">
                Contrôle d'accès système
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-[#ff6a1a] hover:bg-zinc-100 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nom Complet</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-[#e7e1d8] rounded-2xl px-5 py-3.5 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all shadow-sm"
              placeholder="ex: Jean Dupont"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Adresse Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white border border-[#e7e1d8] rounded-2xl px-5 py-3.5 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 transition-all shadow-sm"
              placeholder="user@flexipass.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Assigner un Rôle</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                  formData.role === 'client' 
                    ? 'bg-[#2f2a33] border-[#2f2a33] text-white shadow-sm font-bold text-sm' 
                    : 'bg-white border-[#e7e1d8] text-zinc-500 hover:border-[#ff8a00] hover:text-[#ff8a00] font-bold text-sm'
                }`}
              >
                <UserIcon size={18} />
                <span>Client</span>
              </button>
              <button
                type="button"
                disabled={user !== null && user.role === 'client'}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                  formData.role === 'admin' 
                    ? 'bg-[#ff6a1a] border-[#ff6a1a] text-white shadow-sm font-bold text-sm' 
                    : 'bg-white border-[#e7e1d8] text-zinc-500 hover:border-[#ff8a00] hover:text-[#ff8a00] font-bold text-sm'
                } ${(user !== null && user.role === 'client') ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                title={(user !== null && user.role === 'client') ? "Un client ne peut pas être promu admin ici. Créez un nouvel accès admin." : ""}
              >
                <Shield size={18} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3.5 bg-[#ff6a1a] hover:bg-[#ff5a00] text-white font-bold uppercase tracking-wider text-xs rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {user ? <Save size={18} /> : <UserPlus size={18} />}
                  {user ? "Mettre à jour" : "Créer l'accès"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
