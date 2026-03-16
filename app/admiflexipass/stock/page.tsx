"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ProductTable, { Product } from "@/app/admiflexipass/components/ProductTable";
import ProductModal from "@/app/admiflexipass/components/ProductModal";
import DeleteConfirm from "@/app/admiflexipass/components/DeleteConfirm";
import SuccessToast from "@/app/admiflexipass/components/SuccessToast";
import SearchInput from "@/app/admiflexipass/components/SearchInput";
import { PackagePlus, RefreshCcw, Sparkles } from "lucide-react";

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
      console.log("Suppression du produit :", selectedProduct.id);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", selectedProduct.id);
      
      if (error) throw error;
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
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#12121a]/50 p-8 rounded-[2rem] border border-zinc-900 backdrop-blur-md">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-zinc-100 flex items-center gap-4">
            Gestion du <span className="text-red-500">Stock</span> <Sparkles className="text-red-500 animate-pulse" size={40} />
          </h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            Flux d'inventaire en temps réel actif
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchProducts}
            className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl text-zinc-400 hover:text-white hover:border-zinc-500 transition-all active:scale-90"
          >
            <RefreshCcw size={22} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleCreateTrigger}
            className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-widest rounded-3xl shadow-[0_10px_30px_-10px_rgba(239,68,68,0.5)] flex items-center gap-3 transition-all active:scale-95"
          >
            <PackagePlus size={24} />
            Ajouter un produit
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 group">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Rechercher par titre, ID ou description..." 
          />
        </div>
      </div>

      <div className="relative group min-h-[400px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <ProductTable 
          products={filteredProducts} 
          isLoading={isLoading} 
          onEdit={handleEditTrigger}
          onDelete={(product) => { setSelectedProduct(product); setIsDeleteOpen(true); }}
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
