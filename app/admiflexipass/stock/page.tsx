"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ProductTable, { Product } from "@/app/admiflexipass/components/ProductTable";
import ProductModal from "@/app/admiflexipass/components/ProductModal";
import DeleteConfirm from "@/app/admiflexipass/components/DeleteConfirm";
import SuccessToast from "@/app/admiflexipass/components/SuccessToast";
import SearchInput from "@/app/admiflexipass/components/SearchInput";
import { PackagePlus, RefreshCcw } from "lucide-react";

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // REAL-TIME SYNC
    const channel = supabase
      .channel("products-live-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Realtime product event:", payload.eventType, payload.new);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProducts = products.filter(p => 
    (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.short_description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      // Use the admin API which uses service role key and handles cascade deletion
      const res = await fetch(`/api/admin/products?id=${selectedProduct.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Erreur serveur (${res.status})`);
      }

      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setToast({ message: "Produit supprimé avec succès", type: "success" });
      setIsDeleteOpen(false);
    } catch (err: any) {
      console.error("Erreur Suppression:", err);
      setToast({ message: err.message || "Échec de la suppression", type: "error" });
    }
  };

  const handleEditTrigger = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCreateTrigger = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 bg-zinc-50/50 min-h-screen">
      {/* Header Panel stock */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] border border-[#efe5d9]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2f2a33] flex items-center gap-2 sm:gap-3">
            <span className="w-2.5 h-7 rounded-full bg-[#ff6a1a]"></span>
            Inventaire & <span className="text-[#ff6a1a]">Stock</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ml-4">Gestion des clés et des produits</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreateTrigger}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-sm font-semibold text-sm hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#ff6a1a', color: 'white' }}
          >
            Nouveau
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-[#efe5d9] flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Rechercher par titre, ID ou description..." 
          />
        </div>
      </div>

      <div className="relative group min-h-[400px]">
        <ProductTable 
          products={filteredProducts} 
          isLoading={isLoading} 
          onEdit={handleEditTrigger}
          onDelete={(product) => { setSelectedProduct(product); setIsDeleteOpen(true); }}
          onRefresh={fetchProducts}
          setToast={setToast}
        />
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        product={selectedProduct} 
        onClose={() => setIsModalOpen(false)} 
        onSave={async () => {
          setToast({ message: "Catalogue synchronisé", type: "success" });
          fetchProducts();
        }}
      />

      <DeleteConfirm 
        isOpen={isDeleteOpen}
        title="Supprimer l'enregistrement"
        message={`Cette action supprimera définitivement "${selectedProduct?.title}" de la base de données. C'est irréversible.`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteProduct}
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
