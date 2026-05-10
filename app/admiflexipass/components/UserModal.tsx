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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-[#1e1e2e] w-full max-w-lg rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-zinc-800 flex items-center justify-between text-zinc-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
              {user ? <Save size={24} /> : <UserPlus size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                {user ? "Modifier Membre" : "Nouveau Membre"}
              </h2>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                Contrôle d'accès système
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white bg-zinc-800/50 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nom Complet</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0f0f23] border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-200 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all shadow-inner"
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
              className="w-full bg-[#0f0f23] border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-200 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all shadow-inner"
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
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100 shadow-lg' 
                    : 'bg-[#0f0f23] border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <UserIcon size={18} />
                <span className="font-bold text-sm">Client</span>
              </button>
              <button
                type="button"
                disabled={user !== null && user.role === 'client'}
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                  formData.role === 'admin' 
                    ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-lg shadow-red-500/10' 
                    : 'bg-[#0f0f23] border-zinc-800 text-zinc-500 hover:border-zinc-700'
                } ${(user !== null && user.role === 'client') ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                title={(user !== null && user.role === 'client') ? "Un client ne peut pas être promu admin ici. Créez un nouvel accès admin." : ""}
              >
                <Shield size={18} />
                <span className="font-bold text-sm">Admin</span>
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-wider rounded-2xl shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {user ? <Save size={20} /> : <UserPlus size={20} />}
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
