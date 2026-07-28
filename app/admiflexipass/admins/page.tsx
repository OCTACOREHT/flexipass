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
import { 
  TableProvider, 
  TableHeader, 
  TableHeaderGroup, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  ColumnDef,
  TableColumnHeader
} from "@/components/ui/custom-table";

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
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; role: string } | null>(null);

  // Load current logged-in admin identity
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => { if (d?.admin) setCurrentAdmin(d.admin); })
      .catch(() => {});
  }, []);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [invitePassword, setInvitePassword] = useState("");
  const [showInvitePassword, setShowInvitePassword] = useState(false);
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

  useEffect(() => {
    if (inviteRole === "superadmin") {
      setInvitePermissions({
        dashboard: true,
        orders: true,
        stock: true,
        users: true,
        settings: true,
        admins: true,
      });
    } else if (inviteRole === "admin") {
      setInvitePermissions((prev) => ({
        ...prev,
        admins: false,
      }));
    }
  }, [inviteRole]);

  useEffect(() => {
    if (editRole === "superadmin") {
      setEditPermissions({
        dashboard: true,
        orders: true,
        stock: true,
        users: true,
        settings: true,
        admins: true,
      });
    } else if (editRole === "admin") {
      setEditPermissions((prev) => ({
        ...prev,
        admins: false,
      }));
    }
  }, [editRole]);

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
          password: invitePassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Échec de l'invitation");
      }

      if (data.tempPassword) {
        setSuccess(
          `Compte créé avec succès ! Le collaborateur peut se connecter avec le mot de passe défini.`
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
      setInvitePassword("");
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
    setInvitePassword("");
    setShowInvitePassword(false);
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
    const role = isInvite ? inviteRole : editRole;
    if (role === "superadmin" || key === "admins") return;

    if (isInvite) {
      setInvitePermissions((prev) => ({ ...prev, [key]: val }));
    } else {
      setEditPermissions((prev) => ({ ...prev, [key]: val }));
    }
  };

  const columns: ColumnDef<AdminMember>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <TableColumnHeader column={column} title="Nom" />,
      cell: ({ row }) => <span className="font-bold text-[#2f2a33]">{row.original.name}</span>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => <TableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => <span className="font-mono text-zinc-500">{row.original.email}</span>,
    },
    {
      accessorKey: "role",
      header: ({ column }) => <TableColumnHeader column={column} title="Rôle" />,
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
              role === "superadmin"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : role === "admin"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <Shield className="w-3 h-3" />
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <TableColumnHeader column={column} title="Statut" />,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
              status === "active"
                ? "bg-emerald-50 text-emerald-700"
                : status === "invited"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700"
            }`}
          >
            {status === "active" ? "Actif" : status === "invited" ? "Invité" : "Suspendu"}
          </span>
        );
      },
    },
    {
      accessorKey: "permissions",
      header: () => <span>Permissions d'Accès</span>,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {Object.entries(row.original.permissions || {}).map(([key, value]) => (
            <span
              key={key}
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                value
                  ? "bg-zinc-50 text-zinc-600 border-[#efe5d9]"
                  : "bg-red-50 text-red-400 border-red-100 line-through"
              }`}
            >
              {key}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const admin = row.original;
        const isOwnAccount = currentAdmin?.id === admin.id;
        return (
          <div className="flex items-center justify-end gap-2">
            {/* Password change only allowed for own account */}
            {isOwnAccount && (
              <button
                onClick={() => openPasswordModal(admin)}
                title="Changer mon mot de passe"
                className="p-2 rounded-lg bg-white hover:bg-emerald-50 border border-[#efe5d9] text-zinc-400 hover:text-emerald-700 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => openEditModal(admin)}
              title="Modifier les permissions"
              className="p-2 rounded-lg bg-white hover:bg-zinc-100 border border-[#efe5d9] text-zinc-400 hover:text-[#ff6a1a] transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleToggleStatus(admin)}
              title={admin.status === "active" ? "Suspendre le compte" : "Activer le compte"}
              className={`p-2 rounded-lg border transition-colors ${
                admin.status === "active"
                  ? "bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border-emerald-200"
              }`}
            >
              {admin.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => handleDeleteAdmin(admin.id)}
              title="Supprimer définitivement"
              className="p-2 rounded-lg bg-white hover:bg-red-50 border border-[#efe5d9] text-zinc-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2f2a33] flex items-center gap-2 sm:gap-3">
            Gestion des <span className="text-[#ff6a1a]">Collaborateurs</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide text-sm mt-1">
            Gérez les accès à l'administration et les permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openInviteModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-sm font-semibold text-sm"
            style={{ backgroundColor: '#ff6a1a', color: 'white' }}
          >
            <UserPlus size={16} />
            <span>Nouveau</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && !showInviteModal && !showEditModal && !showPasswordModal && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-700">
          <Check className="w-4 h-4 shrink-0 text-emerald-500" />
          <p className="flex-1">{success}</p>
          <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white border border-[#efe5d9] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="h-6 w-1/4 bg-zinc-200 rounded-lg animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-zinc-100 rounded-xl animate-pulse"></div>
              <div className="h-16 bg-zinc-50 rounded-xl animate-pulse"></div>
              <div className="h-16 bg-zinc-50 rounded-xl animate-pulse"></div>
            </div>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white">
            <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4 text-[#ff6a1a]">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#2f2a33] uppercase tracking-wider">Aucun collaborateur</h3>
            <p className="text-xs text-zinc-500 max-w-sm mt-2">
              Aucun autre administrateur n'a été configuré dans le système. Utilisez le bouton ci-dessus pour envoyer une invitation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <TableProvider columns={columns} data={admins}>
              <TableHeader className="bg-white border-b border-[#efe5d9]">
                {({ headerGroup }) => (
                  <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
                    {({ header }) => (
                      <TableHead 
                        header={header} 
                        key={header.id} 
                        className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider"
                      />
                    )}
                  </TableHeaderGroup>
                )}
              </TableHeader>
              <TableBody className="divide-y divide-[#efe5d9]/60 bg-white">
                {({ row }) => (
                  <TableRow 
                    row={row} 
                    key={row.id} 
                    className="hover:bg-zinc-50 transition-colors text-xs text-zinc-600 bg-white"
                  >
                    {({ cell }) => (
                      <TableCell 
                        cell={cell} 
                        key={cell.id} 
                        className="py-4 px-6"
                      />
                    )}
                  </TableRow>
                )}
              </TableBody>
            </TableProvider>
          </div>
        )}
      </div>

      {/* 1. Modal: Invite New Admin */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-[#efe5d9] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-[#efe5d9] p-5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2f2a33] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#ff6a1a]" />
                Inviter un nouveau Collaborateur
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-400 hover:text-[#ff6a1a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-5 bg-white">
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <p className="flex-1">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Nom Prénom"
                    className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 text-xs text-[#2f2a33] placeholder-zinc-400 outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Adresse Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborateur@flexipass.ht"
                    className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 text-xs text-[#2f2a33] placeholder-zinc-400 outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rôle de Sécurité</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 text-xs text-[#2f2a33] outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                  >
                    <option value="admin">Administrateur Standard (admin)</option>
                    <option value="superadmin">Super Administrateur (superadmin)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showInvitePassword ? "text" : "password"}
                      required
                      value={invitePassword}
                      onChange={(e) => setInvitePassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="w-full rounded-xl border border-[#efe5d9] bg-white pl-4 pr-11 py-2.5 text-xs text-[#2f2a33] placeholder-zinc-400 outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowInvitePassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 hover:text-[#ff6a1a]"
                    >
                      {showInvitePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions List */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Droits d'Accès Sidebar (Permissions)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(invitePermissions).map(([key, value]) => {
                    const meta = permissionMeta[key] || { label: key, icon: Shield, desc: "" };
                    const Icon = meta.icon;
                    const isDisabled = inviteRole === "superadmin" || key === "admins";
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handlePermissionChange(key, !value, true)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all select-none outline-none focus:ring-1 focus:ring-[#ff6a1a]/20 ${
                          isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        } ${
                          value
                            ? "bg-white border-[#ff6a1a] text-[#ff6a1a] shadow-sm"
                            : "bg-white border-[#efe5d9] text-zinc-500 hover:bg-zinc-50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                          value ? "bg-zinc-50 text-[#ff6a1a] border border-zinc-200" : "bg-zinc-50 text-zinc-400 border border-zinc-200"
                        }`}>
                           <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider truncate">{meta.label}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              value ? "border-[#ff6a1a] bg-[#ff6a1a] text-white" : "border-zinc-300 bg-transparent"
                            }`}>
                              {value && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed line-clamp-1">{meta.desc}</p>
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
                  className="rounded-xl border border-[#efe5d9] bg-white hover:bg-zinc-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl hover:bg-[#ff5a00] px-5 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                  style={{ backgroundColor: '#ff6a1a', color: '#ffffff' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Enregistrer</span>
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
          <div className="relative w-full max-w-lg bg-white border border-[#efe5d9] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-[#efe5d9] p-5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2f2a33] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#ff6a1a]" />
                Modifier les Permissions de {selectedAdmin.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-[#ff6a1a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5 bg-white">
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <p className="flex-1">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Email (Non modifiable)</label>
                <input
                  type="text"
                  disabled
                  value={selectedAdmin.email}
                  className="w-full rounded-xl border border-[#efe5d9] bg-zinc-50 px-4 py-2.5 text-xs text-zinc-500 outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Rôle de Sécurité</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 text-xs text-[#2f2a33] outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                  >
                    <option value="admin">Administrateur Standard (admin)</option>
                    <option value="superadmin">Super Administrateur (superadmin)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Statut du Compte</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 text-xs text-[#2f2a33] outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                  >
                    <option value="active">Actif</option>
                    <option value="invited">Invité (Attente activation)</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
              </div>

              {/* Permissions List */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Droits d'Accès Sidebar (Permissions)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(editPermissions).map(([key, value]) => {
                    const meta = permissionMeta[key] || { label: key, icon: Shield, desc: "" };
                    const Icon = meta.icon;
                    const isDisabled = editRole === "superadmin" || key === "admins";
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handlePermissionChange(key, !value, false)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all select-none outline-none focus:ring-1 focus:ring-[#ff6a1a]/20 ${
                          isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                        } ${
                          value
                            ? "bg-white border-[#ff6a1a] text-[#ff6a1a] shadow-sm"
                            : "bg-white border-[#efe5d9] text-zinc-500 hover:bg-zinc-50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                          value ? "bg-zinc-50 text-[#ff6a1a] border border-zinc-200" : "bg-zinc-50 text-zinc-400 border border-zinc-200"
                        }`}>
                           <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider truncate">{meta.label}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                              value ? "border-[#ff6a1a] bg-[#ff6a1a] text-white" : "border-zinc-300 bg-transparent"
                            }`}>
                              {value && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed line-clamp-1">{meta.desc}</p>
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
                  className="rounded-xl border border-[#efe5d9] bg-white hover:bg-zinc-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#ff6a1a] hover:bg-[#ff5a00] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
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
          <div className="relative w-full max-md bg-white border border-[#efe5d9] rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-white border-b border-[#efe5d9] p-5 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2f2a33] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                Changer le mot de passe
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-zinc-400 hover:text-[#ff6a1a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5 bg-white">
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <p className="flex-1">{error}</p>
                  <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-[#efe5d9] bg-zinc-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Compte cible</p>
                <p className="mt-1 text-sm font-bold text-[#2f2a33]">{passwordTarget.name}</p>
                <p className="text-xs text-zinc-500">{passwordTarget.email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 pr-11 text-xs text-[#2f2a33] outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-400 hover:text-[#ff6a1a]"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Confirmer le mot de passe</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#efe5d9] bg-white px-4 py-2.5 text-xs text-[#2f2a33] outline-none focus:border-[#ff6a1a] focus:ring-4 focus:ring-[#ff6a1a]/5 transition"
                />
              </div>

              <p className="text-[11px] leading-relaxed text-zinc-500">
                Cette action est autorisee uniquement au proprietaire du compte ou a un superadmin. La verification finale est faite par l'API.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="rounded-xl border border-[#efe5d9] bg-white hover:bg-zinc-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-500 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
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
