"use client";

import React, { useState } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUpload: (url: string) => void;
}

export default function ImageUploader({ currentImageUrl, onUpload }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const { data, error } = await supabase.storage
        .from("products") // Existing bucket
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(data.path);

      onUpload(publicUrl);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Product Media</label>
        {preview && (
          <button 
            type="button" 
            onClick={() => { setPreview(""); onUpload(""); }}
            className="text-[10px] font-bold text-red-500 hover:text-red-400 p-1 flex items-center gap-1"
          >
            <X size={12} /> REMOVE
          </button>
        )}
      </div>

      <div className={`relative group w-full aspect-[4/3] rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${
        preview ? 'border-[#ff6a1a] bg-orange-50/30' : 'border-[#d4d4d8] hover:border-[#ff6a1a] hover:bg-[#ff6a1a]/5 bg-zinc-50/50'
      }`}>
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 flex flex-col items-center justify-center text-[#ff6a1a] pointer-events-none">
              <div className="p-3 bg-white rounded-full shadow-sm mb-2">
                <Upload size={24} />
              </div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#2f2a33]">Changer le Média</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-zinc-400 group-hover:text-[#ff6a1a] transition-colors duration-300">
            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 text-[#2f2a33] group-hover:text-[#ff6a1a] group-hover:shadow-md transition-all">
              <ImageIcon size={32} strokeWidth={1.5} />
            </div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#2f2a33]">Glissez ou Cliquez</p>
            <p className="text-[10px] mt-2 font-medium text-zinc-400">PNG, JPG (Max 5MB)</p>
          </div>
        )}
        
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleUpload}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {isUploading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center transition-all">
            <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
            <p className="text-white text-xs font-black italic uppercase tracking-widest mt-4 animate-pulse">Uploading...</p>
          </div>
        )}
      </div>
      
      {preview && !isUploading && (
        <div className="flex items-center gap-2 text-emerald-500 px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <CheckCircle2 size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Image sync ready</span>
        </div>
      )}
    </div>
  );
}
