"use client";

import { useEffect, useMemo, useState } from "react";
import Toaster from "@/components/admin/ui/Toaster";
import { useToasts } from "@/components/admin/hooks/useToasts";

type Client = {
  id: string;
  name: string;
  email: string;
  status: "actif" | "inactif";
};

const demoClients: Client[] = [
  { id: "c1", name: "Wanguy Calvert", email: "wanguy@email.com", status: "actif" },
  { id: "c2", name: "Sarah Jean", email: "sarah@email.com", status: "actif" },
];

const loadStoredClients = () => {
  if (typeof window === "undefined") return demoClients;
  const raw = window.localStorage.getItem("admin_clients");
  if (!raw) return demoClients;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : demoClients;
  } catch {
    return demoClients;
  }
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>(loadStoredClients);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toasts, pushToast, dismissToast } = useToasts();
  const STORAGE_KEY = "admin_clients";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }, [clients]);

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      ),
    [clients, search]
  );

  const handleAdd = () => {
    if (!name.trim() || !email.trim()) {
      pushToast({ variant: "error", title: "Champs requis", message: "Renseignez un nom et un email." });
      return;
    }
    const newClient: Client = { id: `c-${Date.now()}`, name: name.trim(), email: email.trim(), status: "actif" };
    setClients((list) => [newClient, ...list]);
    setName("");
    setEmail("");
    pushToast({ variant: "success", title: "Client ajouté", message: `${newClient.name} a été ajouté.` });
  };

  const handleDelete = async (client: Client) => {
    setDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setClients((list) => list.filter((item) => item.id !== client.id));
    setDeleting(false);
    setConfirmDelete(null);
    pushToast({ variant: "success", title: "Suppression", message: `${client.name} supprimé.` });
  };

  return (
    <>
      <Toaster toasts={toasts} onDismiss={dismissToast} />

      <div className="section-head">
        <h2>Clients</h2>
        <div className="head-actions">
          <input
            className="admin-search"
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Ajouter un client</h3>
          <div className="admin-actions">
            <input placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="button" onClick={handleAdd}>
              Ajouter
            </button>
          </div>
        </div>

        <div className="admin-card wide">
          <h3>Liste clients</h3>
          <div className="admin-table">
            <div className="admin-row head">
              <span>Nom</span>
              <span>Email</span>
              <span>Statut</span>
              <span>Actions</span>
            </div>
            {filtered.length === 0 && <div className="admin-empty">Aucun client trouvé.</div>}
            {filtered.map((c) => (
              <div className="admin-row" key={c.id} style={{ gridTemplateColumns: "1.2fr 1.2fr 0.6fr 0.6fr" }}>
                <span>{c.name}</span>
                <span>{c.email}</span>
                <span>{c.status}</span>
                <span>
                  <button className="link danger" onClick={() => setConfirmDelete(c)}>
                    Supprimer
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Confirmer la suppression</h3>
              <button
                className="icon-btn ghost"
                aria-label="Fermer"
                onClick={() => !deleting && setConfirmDelete(null)}
              >
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="modal-body">
              <p className="muted">
                Êtes-vous sûr de vouloir supprimer <strong>{confirmDelete.name}</strong> ? Cette action est
                irréversible.
              </p>
              <div className="confirm-actions">
                <button className="ghost-btn" type="button" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                  Annuler
                </button>
                <button className="btn-danger" type="button" disabled={deleting} onClick={() => handleDelete(confirmDelete)}>
                  {deleting ? "Suppression..." : "Oui, supprimer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
