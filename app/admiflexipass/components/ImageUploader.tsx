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

      <div className={`relative group w-full aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${
        preview ? 'border-zinc-800 bg-[#0f0f23]' : 'border-zinc-800 hover:border-red-500/50 hover:bg-zinc-800/20'
      }`}>
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white pointer-events-none">
              <Upload size={32} />
              <p className="text-xs font-bold mt-2 font-mono">CHANGE MEDIA</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-zinc-600 group-hover:text-zinc-400">
            <ImageIcon size={48} strokeWidth={1} />
            <p className="text-sm font-bold mt-4 font-mono">DRAG & DROP OR CLICK</p>
            <p className="text-[10px] mt-1 font-medium italic">Supports PNG, JPG (Max 5MB)</p>
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
