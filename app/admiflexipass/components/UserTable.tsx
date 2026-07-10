"use client";

import React, { useState } from "react";
import { User, Edit2, Trash2, Shield, UserCheck, ShieldAlert, Loader2 } from "lucide-react";
import { 
  TableProvider, 
  TableHeader, 
  TableHeaderGroup, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  ColumnDef,
  TableColumnHeader,
  TablePageSizeSelector
} from "@/components/ui/custom-table";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";

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
  onRefresh?: () => void;
}

export default function UserTable({ users, onEdit, onDelete, isLoading, onRefresh }: UserTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;

  const handleBulkRole = async (role: "admin" | "client") => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
    if (selectedIds.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir changer le rôle en ${role} pour ces ${selectedIds.length} membres ?`)) return;

    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ role })
        .in("id", selectedIds);

      if (error) throw error;
      setRowSelection({});
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Une erreur est survenue lors du changement de rôle.");
      console.error(err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
    if (selectedIds.length === 0) return;

    if (!confirm(`ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement ces ${selectedIds.length} membres ?`)) return;

    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;
      setRowSelection({});
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Une erreur est survenue lors de la suppression.");
      console.error(err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const columns: ColumnDef<DashboardUser>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center pl-2">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Sélectionner tout"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center pl-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner la ligne"
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => <TableColumnHeader column={column} title="Customer / Member" />,
      cell: ({ row }) => {
        const name = row.original.name || "Client";
        const email = row.original.email || "No Email";
        const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

        const colors = [
          { bg: "bg-red-50 text-red-600", border: "border-red-100" },
          { bg: "bg-amber-50 text-amber-600", border: "border-amber-100" },
          { bg: "bg-indigo-50 text-indigo-600", border: "border-indigo-100" },
          { bg: "bg-purple-50 text-purple-600", border: "border-purple-100" },
          { bg: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
          { bg: "bg-blue-50 text-blue-600", border: "border-blue-100" }
        ];
        const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const color = colors[charCodeSum % colors.length];

        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${color.bg} border ${color.border}`}>
              {initials}
            </div>
            <div className="flex flex-col max-w-[200px] min-w-0">
              <span className="text-[#2f2a33] font-bold text-sm truncate" title={name}>
                {name}
              </span>
              <span className="text-zinc-400 text-xs font-mono truncate" title={email}>
                {email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => <TableColumnHeader column={column} title="Rôle" />,
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            role === 'admin' 
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-zinc-50 text-zinc-500 border border-zinc-200'
          }`}>
            {role === 'admin' ? <Shield size={10} /> : <UserCheck size={10} />}
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <TableColumnHeader column={column} title="Rejoint le" />,
      cell: ({ row }) => (
        <span className="text-zinc-500 text-sm font-medium">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-2">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2 pr-2">
          <button 
            onClick={() => onEdit(row.original)}
            className="p-2 text-zinc-400 hover:text-[#ff6a1a] hover:bg-zinc-50 rounded-lg transition-all"
            title="Modifier"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(row.original)}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 border border-[#efe5d9]/60">
        <div className="h-6 w-1/4 bg-zinc-200 rounded-lg animate-pulse mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-zinc-100 rounded-xl animate-pulse"></div>
          <div className="h-16 bg-zinc-50 rounded-xl animate-pulse"></div>
          <div className="h-16 bg-zinc-50 rounded-xl animate-pulse"></div>
          <div className="h-16 bg-zinc-50 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Premium Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-950 text-white px-6 py-4 rounded-2xl shadow-lg border border-zinc-800 animate-in slide-in-from-top-4 duration-300 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#ff6a1a] text-white text-xs font-extrabold px-3 py-1 rounded-full animate-pulse">
              {selectedCount}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Membres Sélectionnés</span>
          </div>
          <div className="flex items-center gap-3">
            {isBulkProcessing ? (
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                <Loader2 className="w-4 h-4 animate-spin text-[#ff6a1a]" />
                Mise à jour...
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleBulkRole("admin")}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <ShieldAlert size={14} /> Rôle Admin
                </button>
                <button
                  onClick={() => handleBulkRole("client")}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <UserCheck size={14} /> Rôle Client
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
                <button
                  onClick={() => setRowSelection({})}
                  className="text-zinc-400 hover:text-white text-xs font-bold uppercase px-3 py-2.5 transition-colors"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Flat modern table with no vertical lines, no outer border, generous vertical spacing */}
      <div className="w-full bg-white rounded-3xl p-6 border border-[#efe5d9]/60">
        <h3 className="text-lg font-bold text-[#2f2a33] mb-6 pl-2">Users Directory</h3>
        <div className="overflow-x-auto no-scrollbar">
          <TableProvider 
            columns={columns} 
            data={users}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            className="w-full"
            renderTop={<TablePageSizeSelector className="px-2" />}
          >
            <TableHeader className="bg-transparent border-none">
              {({ headerGroup }) => (
                <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
                  {({ header }) => (
                    <TableHead 
                      header={header} 
                      key={header.id} 
                      className="py-5 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-none bg-transparent"
                    />
                  )}
                </TableHeaderGroup>
              )}
            </TableHeader>
            <TableBody className="bg-transparent">
              {({ row }) => (
                <TableRow 
                  row={row} 
                  key={row.id} 
                  className="border-none hover:bg-zinc-50/50 transition-all group bg-transparent align-middle"
                >
                  {({ cell }) => (
                    <TableCell 
                      cell={cell} 
                      key={cell.id} 
                      className="py-5 px-6 border-none align-middle"
                    />
                  )}
                </TableRow>
              )}
            </TableBody>
          </TableProvider>
        </div>
      </div>
    </div>
  );
}
