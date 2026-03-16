"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  FileSpreadsheet, 
  Download, 
  Database, 
  Users, 
  Package, 
  ShoppingBag,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
// import * as XLSX from "xlsx";

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const exportTable = async (tableName: string, fileName: string) => {
    setIsExporting(tableName);
    setStatus(null);
    try {
      // Temporairement désactivé pour corriger le build Vercel:
      // const { data, error } = await supabase.from(tableName).select("*");
      // if (error) throw error;
      // const ws = XLSX.utils.json_to_sheet(data);
      // const wb = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(wb, ws, "Backup");
      // XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setStatus({ type: 'error', msg: "L'export Excel est temporairement désactivé pour le build. Installez 'xlsx' pour le réactiver." });
    } catch (err: any) {
      console.error(`Export error (${tableName}):`, err);
      setStatus({ type: 'error', msg: err.message || "Failed to export data." });
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-3">
          System Settings <Database className="text-red-500" size={32} />
        </h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs mt-1">
          Configuration & Data Management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Data Backup Section */}
        <div className="bg-[#1e1e2e] rounded-[2.5rem] border border-zinc-800 p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-100">Data Export</h3>
              <p className="text-zinc-500 text-xs">Download full Excel backups of your database.</p>
            </div>
          </div>

          {status && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider border animate-in fade-in slide-in-from-top-2 ${
              status.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {status.type === 'success' ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
              {status.msg}
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={() => exportTable('products', 'flexipass_products')}
              disabled={!!isExporting}
              className="w-full group flex items-center justify-between p-5 bg-[#0f0f23] hover:bg-[#16162e] rounded-2xl border border-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <Package className="text-zinc-500 group-hover:text-red-500 transition-colors" size={20} />
                <span className="text-zinc-200 font-bold tracking-tight">Products Catalog</span>
              </div>
              {isExporting === 'products' ? (
                <div className="w-5 h-5 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <Download className="text-zinc-700 group-hover:text-white" size={18} />
              )}
            </button>

            <button 
              onClick={() => exportTable('users', 'flexipass_users')}
              disabled={!!isExporting}
              className="w-full group flex items-center justify-between p-5 bg-[#0f0f23] hover:bg-[#16162e] rounded-2xl border border-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <Users className="text-zinc-500 group-hover:text-blue-500 transition-colors" size={20} />
                <span className="text-zinc-200 font-bold tracking-tight">User Accounts</span>
              </div>
               {isExporting === 'users' ? (
                <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              ) : (
                <Download className="text-zinc-700 group-hover:text-white" size={18} />
              )}
            </button>

            <button 
              onClick={() => exportTable('orders', 'flexipass_orders')}
              disabled={!!isExporting}
              className="w-full group flex items-center justify-between p-5 bg-[#0f0f23] hover:bg-[#16162e] rounded-2xl border border-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <ShoppingBag className="text-zinc-500 group-hover:text-emerald-500 transition-colors" size={20} />
                <span className="text-zinc-200 font-bold tracking-tight">Order Transactions</span>
              </div>
              {isExporting === 'orders' ? (
                <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              ) : (
                <Download className="text-zinc-700 group-hover:text-white" size={18} />
              )}
            </button>
          </div>
        </div>

        {/* System Info Section */}
        <div className="bg-[#1e1e2e] rounded-[2.5rem] border border-zinc-800 p-8 space-y-6 shadow-2xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                <Database size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-100">Environment</h3>
                <p className="text-zinc-500 text-xs">System health and connection status.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0f0f23] rounded-xl border border-zinc-800/50">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Database</span>
                <span className="flex items-center gap-2 text-emerald-500 text-xs font-black italic uppercase">
                  Connected <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0f0f23] rounded-xl border border-zinc-800/50">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Real-time Engine</span>
                <span className="text-zinc-200 text-xs font-mono">Supabase Broadcast v2</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0f0f23] rounded-xl border border-zinc-800/50">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Storage Bucket</span>
                <span className="text-zinc-200 text-xs font-mono">product-images/orders</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800/50">
            <p className="text-zinc-600 text-[10px] font-medium leading-relaxed uppercase tracking-tighter italic">
              FlexiPass Admin Core v1.4.0 <br />
              Secure connection established with production cluster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
