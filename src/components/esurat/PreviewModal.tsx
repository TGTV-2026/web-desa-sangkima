"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export default function PreviewModal({ isOpen, onClose, fileUrl, fileName }: PreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  // Kunci scroll background utama agar tidak ikut lari
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  /* 🔑 KUNCI TOTAL: Menggunakan React Portal untuk melempar komponen ini 
      keluar dari kurungan layout box bapaknya, langsung dipindah ke bawah tag <body> utama */
  return createPortal(
    <div className="fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0 z-[9999] flex items-center justify-center bg-black/50 overflow-hidden antialiased select-none w-screen h-screen">
      
      {/* 📄 BOX PUTIH RAKSASA FULL SATU LAYAR MONITOR UTAMA */}
      <div className="bg-white w-screen h-screen flex flex-col overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pratinjau Lampiran Berkas</p>
            <h3 className="font-sans text-sm font-bold text-gray-800 truncate mt-0.5 max-w-xs sm:max-w-xl">
              {fileName}
            </h3>
          </div>
          
          {/* Tombol Tutup (✕) Pojok Kanan Atas Monitor */}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-medium cursor-pointer transition-colors p-2 leading-none"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        {/* 🖼️ AREA GAMBAR BESAR: Memenuhi Seluruh Sisa Ruang Monitor */}
        <div className="flex-1 w-full bg-white p-6 flex items-center justify-center overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={fileUrl} 
            alt={fileName} 
            className="max-w-full max-h-[82vh] object-contain select-none bg-white drop-shadow-sm"
          />
        </div>

      </div>
    </div>,
    document.body // 🚀 Dilempar langsung menempel di body browser!
  );
}