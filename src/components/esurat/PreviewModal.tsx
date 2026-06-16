"use client";

import { useEffect } from "react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export default function PreviewModal({ isOpen, onClose, fileUrl, fileName }: PreviewModalProps) {
  // Kunci scroll halaman utama saat modal terbuka biar tidak gerak-gerak
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  // Cek apakah file berupa PDF atau Gambar berdasarkan ekstensinya
  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none animate-fade-in">
      {/* 1. Backdrop / Latar Belakang Gelap Blur Klasik */}
      <div 
        className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* 2. Kotak Konten Utama Modal */}
      <div className="relative bg-paper border border-line/80 w-full max-w-4xl h-[80vh] sm:h-[85vh] rounded-sm shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-paper2/30">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-inkmut">Pratinjau Lampiran</p>
            <h3 className="font-serif text-sm sm:text-base font-medium text-pine-900 truncate mt-0.5">{fileName}</h3>
          </div>
          
          {/* Tombol Tutup Premium */}
          <button 
            onClick={onClose}
            className="ml-4 px-3 py-1.5 border border-line hover:border-ink/40 bg-paper hover:bg-paper2 transition-all text-xs font-semibold uppercase tracking-wider rounded-xs text-inkmut hover:text-ink shadow-2xs"
          >
            Tutup
          </button>
        </div>

        {/* Area Dokumen (Flex-1 agar melar otomatis memenuhi sisa kotak) */}
        <div className="flex-1 bg-neutral-100/60 p-2 sm:p-4 flex items-center justify-center overflow-auto">
          {isPdf ? (
            /* Jika PDF: Embed pakai iframe bawaan browser */
            <iframe 
              src={`${fileUrl}#toolbar=1`} 
              className="w-full h-full border border-line/60 bg-white shadow-xs rounded-xs"
              title={fileName}
            />
          ) : (
            /* Jika Gambar: Tampilkan responsive image */
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={fileUrl} 
              alt={fileName} 
              className="max-w-full max-h-full object-contain border border-line/60 shadow-md bg-white p-1"
            />
          )}
        </div>

      </div>
    </div>
  );
}