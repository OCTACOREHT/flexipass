"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Package, Layout, Clock, Zap, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
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

export interface Product {
  id: string;
  title: string;
  price: number;
  active: boolean;
  image_url?: string;
  type?: string;
  plan?: string;
  duration_days?: number;
  currency?: string;
  short_description?: string;
  created_at?: string;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function ProductTable({ products, onEdit, onDelete, isLoading, onRefresh }: ProductTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;

  const handleBulkToggleActive = async (active: boolean) => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
    if (selectedIds.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir ${active ? "activer" : "désactiver"} ces ${selectedIds.length} produits ?`)) return;

    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ active })
        .in("id", selectedIds);

      if (error) throw error;
      setRowSelection({});
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Une erreur est survenue lors de la mise à jour groupée.");
      console.error(err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
    if (selectedIds.length === 0) return;

    if (!confirm(`ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement ces ${selectedIds.length} produits ? cette action est irréversible.`)) return;

    setIsBulkProcessing(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", selectedIds);

      if (error) throw error;
      setRowSelection({});
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Une erreur est survenue lors de la suppression groupée.");
      console.error(err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const columns: ColumnDef<Product>[] = [
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
      accessorKey: "image_url",
      header: () => <div className="text-center w-16">Média</div>,
      cell: ({ row }) => (
        <div className="w-11 h-11 rounded-full bg-zinc-50 border border-[#efe5d9] overflow-hidden flex items-center justify-center mx-auto transition-transform group-hover:scale-105 shadow-sm">
          {row.original.image_url ? (
            <img src={row.original.image_url} alt={row.original.title} className="w-full h-full object-cover" />
          ) : (
            <Package size={18} className="text-zinc-400" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => <TableColumnHeader column={column} title="Product / Service" />,
      cell: ({ row }) => (
        <div>
          <span className="text-[#2f2a33] font-bold text-sm block">{row.original.title}</span>
          <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest flex items-center gap-1">
            <Layout size={10} /> {row.original.type || "Générique"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "plan",
      header: ({ column }) => <TableColumnHeader column={column} title="Plan / Type" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
           <span className="text-[#2f2a33] font-bold text-sm tracking-tight">{row.original.plan || "Standard"}</span>
           {row.original.duration_days && (
             <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-semibold">
               <Clock size={10} /> {row.original.duration_days} Jours
             </span>
           )}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => <TableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => (
        <span className="text-[#2f2a33] font-extrabold text-sm">
          {Number(row.original.price).toLocaleString()} <span className="text-[10px] font-normal text-zinc-500">{row.original.currency || 'HTG'}</span>
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          row.original.active 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {row.original.active ? <Zap size={10} fill="currentColor" /> : <div className="w-2 h-2 rounded-full bg-red-500" />}
          {row.original.active ? 'Actif' : 'Hors-ligne'}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-2">Action</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-3 relative z-[50] pr-2">
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-zinc-50 text-[#2f2a33] hover:text-[#ff6a1a] rounded-xl transition-all border border-[#efe5d9] hover:border-orange-200 shadow-sm active:scale-95"
            title="Modifier"
          >
            <Edit2 size={18} />
          </button>
          <button 
             type="button"
             onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-xl transition-all border border-[#efe5d9] hover:border-red-200 shadow-sm active:scale-95"
            title="Supprimer"
          >
            <Trash2 size={18} />
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
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Produits Sélectionnés</span>
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
                  onClick={() => handleBulkToggleActive(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <ToggleRight size={16} /> Mettre Actif
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <ToggleLeft size={16} /> Hors-ligne
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
        <h3 className="text-lg font-bold text-[#2f2a33] mb-6 pl-2">Product Catalog</h3>
        <div className="overflow-x-auto no-scrollbar">
          <TableProvider 
            columns={columns} 
            data={products}
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
