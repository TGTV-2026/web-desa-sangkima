"use client";

import React, { useEffect, useState } from "react";

export type ToastType = "info" | "success" | "error";

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({
  id,
  title,
  message,
  type = "info",
  duration = 4000,
  onClose,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const triggerClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Jeda 300ms untuk animasi pop-close keluar ke atas
  };

  useEffect(() => {
    // Jalankan timer penutupan langsung menggunakan setTimeout standar (Sangat stabil di iOS)
    const timer = setTimeout(() => {
      triggerClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration]);

  const color =
    type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-[#70C7FF]";

  return (
    <div className={`w-max max-w-[calc(100vw-32px)] md:min-w-[360px] md:max-w-[420px] bg-white shadow-[0_15px_35px_rgba(0,0,0,0.06)] rounded-[16px] overflow-hidden border border-gray-100 font-sans transition-all will-change-transform box-border
    ${isExiting ? "opacity-0 -translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100 animate-fade-in"}`}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Ikon Status */}
        <div className="mt-0.5 font-bold text-sm select-none">
          {type === "success" && <span className="text-green-500">✓</span>}
          {type === "error" && <span className="text-red-500">✕</span>}
          {type === "info" && <span className="text-[#00A3FF]">i</span>}
        </div>

        {/* Konten Teks */}
        <div className="flex-1 min-w-0">
          {title && <div className="font-extrabold text-sm text-black mb-0.5 truncate">{title}</div>}
          <div className="text-xs text-[#797979] font-medium leading-relaxed break-words">{message}</div>
        </div>

        {/* Tombol Silang */}
        <button
          onClick={triggerClose}
          className="text-gray-300 hover:text-black transition-colors text-xs p-0.5 select-none"
        >
          ✕
        </button>
      </div>

      {/* Progress Bar Statis Beranimasi CSS (Jauh lebih aman untuk batre & performa iPhone 13) */}
      <div className="h-[3px] bg-gray-100 w-full relative">
        <div
          className={`${color} h-full absolute left-0 top-0 transition-all rounded-full`}
          style={{ 
            width: "100%",
            animation: `shrinkWidth ${duration}ms linear forwards` 
          }}
        />
      </div>

      {/* Tambahkan style internal khusus untuk menggerakkan progress bar tanpa JavaScript */}
      <style jsx>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}