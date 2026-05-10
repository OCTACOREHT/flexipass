"use client";

import React from "react";
import { User, Edit2, Trash2, Shield, UserCheck } from "lucide-react";

export interface DashboardUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
  created_at: string;
}

interface UserTableProps {
  users: DashboardUser[];
  onEdit: (user: DashboardUser) => void;
  onDelete: (user: DashboardUser) => void;
  isLoading: boolean;
}

export default function UserTable({ users, onEdit, onDelete, isLoading }: UserTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-[#1e1e2e] rounded-3xl border border-zinc-800 p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-sm font-medium">Synchronisation des membres...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#1e1e2e] rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-800/20 border-b border-zinc-800">
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Membre</th>
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Rôle</th>
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Rejoint le</th>
              <th className="py-5 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 px-6 text-center text-zinc-500 italic">
                  Aucun utilisateur trouvé dans la base de données.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-all group">
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-red-500/10 group-hover:text-red-500 transition-colors">
                        <User size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-100 font-bold">{user.name}</span>
                        <span className="text-zinc-500 text-xs">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' 
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                        : 'bg-zinc-700/30 text-zinc-400 border border-zinc-700/50'
                    }`}>
                      {user.role === 'admin' ? <Shield size={10} /> : <UserCheck size={10} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-zinc-500 text-sm italic">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit(user)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(user)}
                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
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
