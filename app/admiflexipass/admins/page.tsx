"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Mail,
  Edit2,
  KeyRound,
  Eye,
  EyeOff,
  LayoutDashboard,
  Package,
  TrendingUp,
  Users,
  Settings
} from "lucide-react";

interface AdminMember {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
  status: string;
  created_at: string;
}

const DEFAULT_PERMISSIONS = {
  dashboard: true,
  orders: true,
  stock: true,
  users: true,
  settings: true,
  admins: false,
};

const permissionMeta: Record<string, { label: string; icon: any; desc: string }> = {
  dashboard: { label: "Tableau de Bord", icon: LayoutDashboard, desc: "Accès au résumé global de l'activité" },
  orders: { label: "Commandes", icon: Package, desc: "Gestion et suivi des transactions" },
  stock: { label: "Catalogue Produits", icon: TrendingUp, desc: "Gestion des produits et stocks" },
  users: { label: "Liste Membres", icon: Users, desc: "Liste et blocage des clients" },
  settings: { label: "Paramètres", icon: Settings, desc: "Configuration de la plateforme" },
  admins: { label: "Gestion Admins", icon: Shield, desc: "Gestion des collaborateurs" },
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [invitePermissions, setInvitePermissions] = useState<Record<string, boolean>>({ ...DEFAULT_PERMISSIONS });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminMember | null>(null);
  const [editRole, setEditRole] = useState("admin");
  const [editPermissions, setEditPermissions] = useState<Record<string, boolean>>({});
  const [editStatus, setEditStatus] = useState("active");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<AdminMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch all admin members
  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/members");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Impossible de charger les administrateurs");
      }
      setAdmins(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle invitation
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          permissions: invitePermissions,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de l'invitation");
      }

      if (data.tempPassword) {
        setSuccess(
          `Compte créé avec succès ! Mot de passe temporaire : ${data.tempPassword} (Copiez-le et transmettez-le de manière sécurisée)`
        );
      } else {
        setSuccess(
          data.warning
            ? `Compte configuré ! ${data.warning}`
            : "Compte collaborateur configuré avec succès !"
        );
      }
      setShowInviteModal(false);
      
      // Reset form
      setInviteName("");
      setInviteEmail("");
      setInviteRole("admin");
      setInvitePermissions({ ...DEFAULT_PERMISSIONS });

      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAdmin.id,
          role: editRole,
          permissions: editPermissions,
          status: editStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de la mise à jour");
      }

      setSuccess("Permissions de l'administrateur mises à jour !");
      setShowEditModal(false);
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteAdmin = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cet administrateur ?")) return;

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/members?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de la suppression");
      }

      setSuccess("Administrateur supprimé avec succès !");
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle status toggle (Suspend / Activate)
  const handleToggleStatus = async (admin: AdminMember) => {
    const nextStatus = admin.status === "active" ? "suspended" : "active";
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: admin.id,
          status: nextStatus,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec du changement de statut");
      }

      setSuccess(
        nextStatus === "suspended"
          ? "Compte administrateur suspendu."
          : "Compte administrateur activé."
      );
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openInviteModal = () => {
    setError(null);
    setSuccess(null);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("admin");
    setInvitePermissions({ ...DEFAULT_PERMISSIONS });
    setShowInviteModal(true);
  };

  const openEditModal = (admin: AdminMember) => {
    setError(null);
    setSuccess(null);
    setSelectedAdmin(admin);
    setEditRole(admin.role);
    setEditPermissions({ ...admin.permissions });
    setEditStatus(admin.status);
    setShowEditModal(true);
  };

  const openPasswordModal = (admin: AdminMember) => {
    setError(null);
    setSuccess(null);
    setPasswordTarget(admin);
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTarget) return;

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: passwordTarget.id,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Echec de la modification du mot de passe");
      }

      setSuccess(`Mot de passe mis a jour pour ${passwordTarget.email}.`);
      setShowPasswordModal(false);
      setPasswordTarget(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (
    key: string,
    val: boolean,
    isInvite: boolean
  ) => {
    if (isInvite) {
      setInvitePermissions((prev) => ({ ...prev, [key]: val }));
    } else {
      setEditPermissions((prev) => ({ ...prev, [key]: val }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141527] border border-white/5 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">
            Gestion des <span className="text-red-500">Collaborateurs</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Gérez les comptes d'accès à l'administration, attribuez des rôles et paramétrez les permissions d'affichage de la Sidebar.
          </p>
        </div>
        <button
          onClick={openInviteModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-500/10 active:translate-y-0.5 transition-all duration-200 md:-translate-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inviter un Admin</span>
        </button>
      </div>

      {/* Notifications */}
      {error && !showInviteModal && !showEditModal && !showPasswordModal && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-200">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <p className="flex-1">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-[#141527] border border-white/5 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            <p className="text-xs uppercase tracking-widest font-bold">Chargement des membres...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-[#1b1c35] border border-white/5 flex items-center justify-center mb-4 text-zinc-500">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Aucun collaborateur</h3>
            <p className="text-xs text-zinc-400 max-w-sm mt-2">
              Aucun autre administrateur n'a été configuré dans le système. Utilisez le bouton ci-dessus pour envoyer une invitation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-[#0d0e1b]/50">
                  <th className="py-4 px-6">Nom</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Rôle</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6">Permissions d'Accès</th>
                  <th className="py-4 px-6 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-[#1b1c35]/30 transition-colors text-xs text-zinc-300">
                    <td className="py-4 px-6 font-semibold text-white">{admin.name}</td>
                    <td className="py-4 px-6 font-mono text-zinc-400">{admin.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          admin.role === "superadmin"
                            ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                            : admin.role === "admin"
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                              : "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {admin.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                          admin.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : admin.status === "invited"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {admin.status === "active" ? "Actif" : admin.status === "invited" ? "Invité" : "Suspendu"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(admin.permissions || {}).map(([key, value]) => (
                          <span
                            key={key}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              value
                                ? "bg-zinc-700/50 text-zinc-200 border border-white/10"
                                : "bg-red-950/20 text-red-900/50 border border-red-950/30 line-through"
                            }`}
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 pl-6 pr-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openPasswordModal(admin)}
                          title="Changer le mot de passe"
                          className="p-2 rounded-lg bg-[#1c1d35] hover:bg-emerald-500/15 border border-white/5 text-zinc-400 hover:text-emerald-300 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(admin)}
                          title="Modifier les permissions"
                          className="p-2 rounded-lg bg-[#1c1d35] hover:bg-[#2a2b4d] border border-white/5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          title={admin.status === "active" ? "Suspendre le compte" : "Activer le compte"}
                          className={`p-2 rounded-lg border border-white/5 transition-colors ${
                            admin.status === "active"
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
                          }`}
                        >
                          {admin.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          title="Supprimer définitivement"
                          className="p-2 rounded-lg bg-[#1c1d35] hover:bg-red-600/20 border border-white/5 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Modal: Invite New Admin */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#141527] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Header */}
            <div className="bg-[#1b1c35] border-b border-white/5 p-5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-red-500" />
                Inviter un nouvel Collaborateur
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <p className="flex-1">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Nom Prénom"
                    className="w-full rounded-xl border border-white/5 bg-[#0a0b12] px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-red-500/35 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Adresse Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborateur@flexipass.ht"
                    className="w-full rounded-xl border border-white/5 bg-[#0a0b12] px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-red-500/35 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rôle de Sécurité</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full rounded-xl border border-white/5 bg-[#0a0b12] px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-red-500/35 transition"
                >
                  <option value="admin">Administrateur Standard (admin)</option>
                  <option value="support">Agent Support (support)</option>
                  <option value="superadmin">Super Administrateur (superadmin)</option>
                </select>
              </div>

              {/* Permissions List */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Droits d'Accès Sidebar (Permissions)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(invitePermissions).map(([key, value]) => {
                    const meta = permissionMeta[key] || { label: key, icon: Shield, desc: "" };
                    const Icon = meta.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePermissionChange(key, !value, true)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all select-none cursor-pointer outline-none focus:ring-1 focus:ring-red-500/20 ${
                          value
                            ? "bg-red-500/10 border-red-500/30 text-white shadow-[0_0_15px_rgba(239,68,68,0.03)]"
                            : "bg-[#0a0b12] border-white/5 text-zinc-400 hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                          value ? "bg-red-500/20 text-red-400" : "bg-[#141527] text-zinc-500"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider truncate">{meta.label}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              value ? "border-red-500 bg-red-500 text-white" : "border-zinc-700 bg-transparent"
                            }`}>
                              {value && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed line-clamp-1">{meta.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-white/10 bg-transparent hover:bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Invitation...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Envoyer l'Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Edit Admin Permissions */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#141527] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Header */}
            <div className="bg-[#1b1c35] border-b border-white/5 p-5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                Modifier les Permissions de {selectedAdmin.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <p className="flex-1">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email (Non modifiable)</label>
                <input
                  type="text"
                  disabled
                  value={selectedAdmin.email}
                  className="w-full rounded-xl border border-white/5 bg-[#0a0b12]/60 px-4 py-2.5 text-xs text-zinc-500 outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rôle de Sécurité</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-[#0a0b12] px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-red-500/35 transition"
                  >
                    <option value="admin">Administrateur Standard (admin)</option>
                    <option value="support">Agent Support (support)</option>
                    <option value="superadmin">Super Administrateur (superadmin)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Statut du Compte</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-[#0a0b12] px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-red-500/35 transition"
                  >
                    <option value="active">Actif</option>
                    <option value="invited">Invité (Attente activation)</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
              </div>

              {/* Permissions List */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Droits d'Accès Sidebar (Permissions)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(editPermissions).map(([key, value]) => {
                    const meta = permissionMeta[key] || { label: key, icon: Shield, desc: "" };
                    const Icon = meta.icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePermissionChange(key, !value, false)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all select-none cursor-pointer outline-none focus:ring-1 focus:ring-red-500/20 ${
                          value
                            ? "bg-red-500/10 border-red-500/30 text-white shadow-[0_0_15px_rgba(239,68,68,0.03)]"
                            : "bg-[#0a0b12] border-white/5 text-zinc-400 hover:bg-white/[0.02]"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                          value ? "bg-red-500/20 text-red-400" : "bg-[#141527] text-zinc-500"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider truncate">{meta.label}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              value ? "border-red-500 bg-red-500 text-white" : "border-zinc-700 bg-transparent"
                            }`}>
                              {value && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed line-clamp-1">{meta.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-white/10 bg-transparent hover:bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500 hover:bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Sauvegarder</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && passwordTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#141527] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="bg-[#1b1c35] border-b border-white/5 p-5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Changer le mot de passe
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <p className="flex-1">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-[#0a0b12] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Compte cible</p>
                <p className="mt-1 text-sm font-bold text-white">{passwordTarget.name}</p>
                <p className="text-xs text-zinc-400">{passwordTarget.email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/5 bg-[#0a0b12] px-4 py-2.5 pr-11 text-xs text-zinc-200 outline-none focus:border-emerald-500/35 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-500 hover:text-white"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Confirmer le mot de passe</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-white/5 bg-[#0a0b12] px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/35 transition"
                />
              </div>

              <p className="text-[11px] leading-relaxed text-zinc-500">
                Cette action est autorisee uniquement au proprietaire du compte ou a un superadmin. La verification finale est faite par l'API.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-xl border border-white/10 bg-transparent hover:bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
