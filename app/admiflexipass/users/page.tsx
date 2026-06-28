"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import UserTable, { DashboardUser } from "@/app/admiflexipass/components/UserTable";
import UserModal from "@/app/admiflexipass/components/UserModal";
import DeleteConfirm from "@/app/admiflexipass/components/DeleteConfirm";
import SuccessToast from "@/app/admiflexipass/components/SuccessToast";
import SearchInput from "@/app/admiflexipass/components/SearchInput";
import { UserPlus, RefreshCcw } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    // REAL-TIME SYNC
    const channel = supabase
      .channel("users-realtime-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleSaveUser = async (data: Partial<DashboardUser>) => {
    try {
      if (selectedUser) {
        // Update
        const { error } = await supabase
          .from("users")
          .update(data)
          .eq("id", selectedUser.id);
        if (error) throw error;
        setToast({ message: "Utilisateur mis à jour avec succès", type: "success" });
      } else {
        // Create
        const { error } = await supabase
          .from("users")
          .insert([data]);
        if (error) throw error;
        setToast({ message: "Utilisateur créé avec succès", type: "success" });
      }
      fetchUsers();
    } catch (err: any) {
      setToast({ message: err.message || "L'opération a échoué", type: "error" });
      throw err;
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedUser.id);

      if (error) throw error;
      setToast({ message: "Utilisateur supprimé avec succès", type: "success" });
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setToast({ message: err.message || "Échec de la suppression", type: "error" });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-3">
            Répertoire des <span className="text-red-500">Membres</span>
          </h1>
          <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs mt-1">
            Contrôle d'Accès & Gestion des Utilisateurs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-4 bg-[#1e1e2e] border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-lg shadow-black/20"
          >
            <RefreshCcw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="px-6 py-4 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-wider rounded-2xl shadow-xl shadow-red-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <UserPlus size={20} />
            Ajouter un Membre
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher par nom ou email..."
          />
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        isLoading={isLoading}
        onEdit={(user) => {
          setSelectedUser(user);
          setIsModalOpen(true);
        }}
        onDelete={(user) => {
          setSelectedUser(user);
          setIsDeleteOpen(true);
        }}
      />

      <UserModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
      />

      <DeleteConfirm
        isOpen={isDeleteOpen}
        title="Supprimer le Compte"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedUser?.name} ? Cette action est irréversible.`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteUser}
      />

      {toast && (
        <SuccessToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
