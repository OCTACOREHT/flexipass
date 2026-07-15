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
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2f2a33] flex items-center gap-2 sm:gap-3">
            Gestion du <span className="text-[#ff6a1a]">Stock</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide text-sm mt-1">
            Gérez votre catalogue de produits et inventaire.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCreateTrigger}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-sm font-semibold text-sm"
            style={{ backgroundColor: '#ff6a1a', color: 'white' }}
          >
            <PackagePlus size={16} />
            <span>Nouveau</span>
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
        <ProductTable 
          products={filteredProducts} 
          isLoading={isLoading} 
          onEdit={handleEditTrigger}
          onDelete={(product) => { setSelectedProduct(product); setIsDeleteOpen(true); }}
          onRefresh={fetchProducts}
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
