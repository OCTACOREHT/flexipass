"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Eye, Check, X, Loader2 } from "lucide-react";
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
import { Order } from "./OrderRow";

interface OrderTableProps {
  orders: Order[];
  onView: (order: Order) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function OrderTable({ orders, onView, isLoading, onRefresh }: OrderTableProps) {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const selectedCount = Object.keys(rowSelection).filter(k => rowSelection[k]).length;

  const handleBulkApprove = async () => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
    if (selectedIds.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir approuver et délivrer ces ${selectedIds.length} commandes ?`)) return;

    setIsBulkProcessing(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/orders/${id}/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deliveredEmail: "", 
              deliveredDetails: "Approuvé par lot admin",
            }),
          })
        )
      );
      setRowSelection({});
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Une erreur est survenue lors de l'approbation groupée.");
      console.error(err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    const selectedIds = Object.keys(rowSelection).filter(k => rowSelection[k]);
    if (selectedIds.length === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir refuser ces ${selectedIds.length} commandes ?`)) return;

    setIsBulkProcessing(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/orders/${id}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rejectReason: "Refusé par lot admin",
            }),
          })
        )
      );
      setRowSelection({});
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Une erreur est survenue lors du refus groupé.");
      console.error(err);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const columns: ColumnDef<Order>[] = [
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
      accessorKey: "id",
      header: ({ column }) => <TableColumnHeader column={column} title="Deal ID" />,
      cell: ({ row }) => (
        <span className="text-[#2f2a33] font-bold text-sm tracking-tight" title={row.original.id}>
          #{row.original.id.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: "user_name",
      header: ({ column }) => <TableColumnHeader column={column} title="Customer" />,
      cell: ({ row }) => {
        const name = row.original.user_name || "Client";
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
      accessorKey: "product_id",
      header: ({ column }) => <TableColumnHeader column={column} title="Product/Service" />,
      cell: ({ row }) => (
        <span className="text-zinc-600 text-sm font-semibold">
          {row.original.gift_code ? "Carte Cadeau" : "Abonnement Premium"}
        </span>
      ),
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => <TableColumnHeader column={column} title="Deal Value" />,
      cell: ({ row }) => (
        <span className="font-extrabold text-[#2f2a33] text-sm">
          {row.original.total_amount.toFixed(2)} HTG
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <TableColumnHeader column={column} title="Close Date" />,
      cell: ({ row }) => (
        <span className="text-zinc-500 text-sm font-medium">
          {format(new Date(row.original.created_at), "yyyy-MM-dd")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => <TableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              status === "completed" || status === "delivered"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : status === "rejected"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {status === "completed" || status === "delivered"
              ? "Complete"
              : status === "rejected"
              ? "Cancel"
              : "Pending"}
          </span>
        );
      },
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
              onView(row.original);
            }}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-zinc-50 text-[#2f2a33] hover:text-[#ff6a1a] rounded-xl transition-all border border-[#efe5d9] hover:border-orange-200 active:scale-95"
            title="Voir les détails"
          >
            <Eye size={18} />
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
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Commandes Sélectionnées</span>
          </div>
          <div className="flex items-center gap-3">
            {isBulkProcessing ? (
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                <Loader2 className="w-4 h-4 animate-spin text-[#ff6a1a]" />
                Traitement...
              </div>
            ) : (
              <>
                <button
                  onClick={handleBulkApprove}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <Check size={14} /> Approuver
                </button>
                <button
                  onClick={handleBulkReject}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <X size={14} /> Refuser
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
      <div className="w-full bg-white rounded-2xl p-4 border border-[#efe5d9]/60">
        <h3 className="text-base font-bold text-[#2f2a33] mb-4 pl-2">Recent Orders</h3>
        <div className="overflow-x-auto no-scrollbar">
          <TableProvider 
            columns={columns} 
            data={orders}
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
                      className="py-2.5 px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] border-none bg-transparent"
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
                      className="py-2.5 px-4 border-none align-middle"
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
