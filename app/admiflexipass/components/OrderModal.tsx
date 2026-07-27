"use client";

import React, { useEffect, useState } from "react";
import { X, ExternalLink, ShieldCheck } from "lucide-react";
import { Order } from "./OrderRow";
import { format } from "date-fns";

interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderModal({ order, isOpen, onClose, onSuccess }: OrderModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountProfile, setAccountProfile] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedAccountId("");
    setAccountEmail("");
    setAccountPassword("");
    setAccountProfile("");
    setLoadingAccounts(true);
    fetch("/api/admin/accounts")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data?.accounts) ? data.accounts : [];
        setAccounts(list);
        const firstUnused = list.find((a: any) => !a.is_used);
        if (firstUnused) {
          setSelectedAccountId(firstUnused.id);
        }
      })
      .catch(() => setAccounts([]))
      .finally(() => setLoadingAccounts(false));
  }, [isOpen]);

  useEffect(() => {
    if (!selectedAccountId) return;
    const acc = accounts.find((a) => a.id === selectedAccountId);
    if (acc) {
      setAccountEmail(acc.email || "");
      setAccountPassword("");
    }
  }, [selectedAccountId, accounts]);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedAccountId) return;
    if (accountEmail) return;
    const fallbackEmail = (order as any)?.email || (order as any)?.customer_email || "";
    if (fallbackEmail) setAccountEmail(fallbackEmail);
  }, [isOpen, selectedAccountId, accountEmail, order]);

  if (!isOpen || !order) return null;

  const handleApprove = async () => {
    if (!order?.id) {
      alert("ID de commande manquant.");
      return;
    }
    const manualMissing = !selectedAccountId && (!accountEmail.trim() || !accountPassword.trim());
    if (manualMissing) {
      alert("Veuillez saisir un compte mot de passe .");
      return;
    }
    setIsApproving(true);
    try {
      const payload = selectedAccountId
        ? { account_id: selectedAccountId, profile: accountProfile || null, order_id: order.id }
        : {
            account_email: accountEmail.trim(),
            account_password: accountPassword.trim(),
            profile: accountProfile || null,
            order_id: order.id,
          };

      const res = await fetch(`/api/orders/${order.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur lors de l'approbation de la commande:", err);
      const errorMsg = err.message || JSON.stringify(err);
      alert(`Échec de l'approbation : ${errorMsg}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!order?.id) {
      alert("ID de commande manquant.");
      return;
    }
    const ok = confirm("Confirmer le refus de cette commande ?");
    if (!ok) return;
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: order.id }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Erreur lors du refus de la commande:", err);
      const errorMsg = err.message || JSON.stringify(err);
      alert(`Echec du refus : ${errorMsg}`);
    } finally {
      setIsRejecting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-2xl rounded-3xl border border-[#efe5d9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-[#efe5d9] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-[#2f2a33] flex items-center gap-2">
              Détails de la Commande <span className="text-zinc-400 text-sm font-mono">#{order.id.slice(0, 8)}</span>
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              Passée le {format(new Date(order.created_at), "d MMMM yyyy 'à' HH:mm")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-[#ff6a1a] hover:bg-zinc-100 transition-colors rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Client</p>
              <p className="text-[#2f2a33] font-semibold">
                {(order as any).user_name || "Client"} -{" "}
                <span className="text-zinc-500 font-mono text-[10px]">
                  {(order as any).email || (order as any).customer_email || order.user_id}
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Montant de la Commande</p>
              <p className="text-2xl font-bold text-[#ff6a1a]">{Number(order.total_amount).toFixed(2)} HTG</p>
            </div>
          </div>

          <div className="space-y-4 p-6 rounded-2xl border border-[#efe5d9] bg-zinc-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#efe5d9] flex items-center justify-center text-[#ff6a1a]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-black tracking-widest text-[#ff6a1a]">Livraison du compte</p>
                  <p className="text-[12px] text-zinc-500">Le champ Email se remplit automatiquement, saisis manuellement les autres.</p>
                </div>
              </div>
              {loadingAccounts && <span className="text-[10px] text-zinc-500">Chargement...</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500">Email du compte</label>
                <input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  disabled={!!selectedAccountId}
                  onFocus={() => {
                    if (selectedAccountId && !accountEmail) {
                      const acc = accounts.find((a) => a.id === selectedAccountId);
                      if (acc) setAccountEmail(acc.email || "");
                    }
                  }}
                  className="w-full mt-2 rounded-xl bg-white border border-[#e7e1d8] px-3 py-2 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-zinc-500">Mot de passe</label>
                <input
                  type="text"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  disabled={!!selectedAccountId}
                  onFocus={() => {
                    if (selectedAccountId && !accountPassword) {
                      const acc = accounts.find((a) => a.id === selectedAccountId);
                      if (acc) setAccountPassword(acc.password_encrypted || "");
                    }
                  }}
                  className="w-full mt-2 rounded-xl bg-white border border-[#e7e1d8] px-3 py-2 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500">Profil (optionnel)</label>
              <input
                type="text"
                value={accountProfile}
                onChange={(e) => setAccountProfile(e.target.value)}
                className="w-full mt-2 rounded-xl bg-white border border-[#e7e1d8] px-3 py-2 text-[#2f2a33] placeholder-zinc-400 focus:outline-none focus:border-[#ff8a00] focus:ring-4 focus:ring-[#ff8a00]/5"
              />
            </div>
          </div>

          {order.payment_proof_url && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Preuve de Paiement</p>
                <a
                  href={order.payment_proof_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ff6a1a] text-xs flex items-center gap-1 hover:underline font-bold"
                >
                  Ouvrir dans un nouvel onglet <ExternalLink size={12} />
                </a>
              </div>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-50 border border-[#efe5d9] group">
                <img src={order.payment_proof_url} alt="Preuve de Paiement" className="w-full h-full object-contain" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#efe5d9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                order.status === "completed" || order.status === "delivered"
                  ? "bg-emerald-500"
                  : order.status === "rejected"
                  ? "bg-red-500"
                  : "bg-amber-500"
              }`}
            ></div>
            <span className="text-xs text-zinc-600 font-bold capitalize">
              {order.status === "completed" || order.status === "delivered"
                ? "Terminee"
                : order.status === "rejected"
                ? "Refusee"
                : "En attente"}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-zinc-600 font-semibold hover:bg-zinc-100 hover:text-zinc-800 transition-all border border-transparent"
            >
              Fermer
            </button>
            {order.status === "pending" && (
              <>
                <button
                  onClick={handleReject}
                  disabled={isRejecting || isApproving}
                  className="px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 disabled:opacity-50"
                >
                  {isRejecting ? (
                    <div className="w-5 h-5 border-2 border-red-700/20 border-t-red-700 rounded-full animate-spin"></div>
                  ) : (
                    <X size={18} />
                  )}
                  Refuser
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="px-8 py-2.5 hover:bg-[#ff5a00] font-bold rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  style={{ backgroundColor: '#ff6a1a', color: '#ffffff' }}
                >
                  {isApproving ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <ShieldCheck size={20} />
                  )}
                  Approuver & Délivrer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
