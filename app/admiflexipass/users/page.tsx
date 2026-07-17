"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import UserTable, { DashboardUser } from "@/app/admiflexipass/components/UserTable";
import UserModal from "@/app/admiflexipass/components/UserModal";
import SignatureModal from "@/app/admiflexipass/components/SignatureModal";
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
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);

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
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2f2a33] flex items-center gap-2 sm:gap-3">
            Répertoire des <span className="text-[#ff6a1a]">Membres</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide text-sm mt-1">
            Gérez vos membres et leurs accès.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-sm font-semibold text-sm"
            style={{ backgroundColor: '#ff6a1a', color: 'white' }}
          >
            <UserPlus size={16} />
            <span>Nouveau</span>
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
        onViewSignature={(user) => {
          setSelectedUser(user);
          setIsSignatureOpen(true);
        }}
        onRefresh={fetchUsers}
      />

      <SignatureModal
        isOpen={isSignatureOpen}
        user={selectedUser}
        onClose={() => setIsSignatureOpen(false)}
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
