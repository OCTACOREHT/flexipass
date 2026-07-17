"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileCheck2, Loader2, Calendar, ShieldCheck, X } from "lucide-react";
import type { DashboardUser } from "./UserTable";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DashboardUser | null;
}

interface PolicySignature {
  id: string;
  policy_key: string;
  accepted_at: string;
  ip_address: string | null;
  created_at: string;
}

export default function SignatureModal({ isOpen, onClose, user }: SignatureModalProps) {
  const [signature, setSignature] = useState<PolicySignature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchSignature = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_policy_acceptances")
          .select("*")
          .eq("user_id", user.id)
          .eq("policy_key", "privacy_policy")
          .maybeSingle();

        if (error) {
          console.error("Error fetching signature:", error);
        } else {
          setSignature(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignature();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header style PDF */}
        <div className="bg-[#f8f9fa] border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Certificat de Consentement</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Politique de confidentialité</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-500">Recherche de la signature...</p>
            </div>
          ) : signature ? (
            <div className="space-y-8">
              
              {/* Document Status */}
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-100">
                <ShieldCheck size={18} />
                <span className="font-semibold text-sm">Document accepté et signé numériquement.</span>
              </div>

              {/* Informations du signataire */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 border-b border-dashed border-gray-200 pb-3">
                  <span className="text-gray-500 text-sm">Signataire</span>
                  <div className="col-span-2">
                    <div className="font-bold text-gray-900">{user.name || "Client"}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-b border-dashed border-gray-200 pb-3">
                  <span className="text-gray-500 text-sm">Horodatage</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-900 font-medium text-sm">
                      {new Date(signature.accepted_at).toLocaleString("fr-FR", {
                        dateStyle: "long",
                        timeStyle: "medium"
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-b border-dashed border-gray-200 pb-3">
                  <span className="text-gray-500 text-sm">Adresse IP</span>
                  <div className="col-span-2 font-mono text-sm text-gray-700">
                    {signature.ip_address || "Non enregistrée"}
                  </div>
                </div>
              </div>

              {/* Bloc de signature visuelle */}
              <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200 text-center relative overflow-hidden">
                <div className="absolute top-2 right-2 text-xs text-gray-400 uppercase tracking-widest font-bold">
                  Validé
                </div>
                
                <p className="text-sm text-gray-500 mb-2">Signature Électronique (Consentement explicite)</p>
                <div 
                  className="font-medium text-4xl text-blue-900/80 mb-2"
                  style={{ fontFamily: "'Brush Script MT', 'Caveat', cursive", transform: "rotate(-2deg)" }}
                >
                  {user.name || user.email.split('@')[0]}
                </div>
                
                <div className="text-[10px] text-gray-400 font-mono mt-4 pt-4 border-t border-gray-200/50">
                  ID: {signature.id.toUpperCase()}<br/>
                  Empreinte horodatée du consentement
                </div>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
                <X size={24} />
              </div>
              <h3 className="font-bold text-gray-900">Aucune signature trouvée</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Cet utilisateur n'a pas encore accepté la politique de confidentialité, ou il l'a fait avant l'implémentation de ce système.
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Fermer le document
          </button>
        </div>
      </div>
    </div>
  );
}
