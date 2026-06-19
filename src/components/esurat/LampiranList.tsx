"use client";

import { useState } from "react";
import PreviewModal from "@/components/esurat/PreviewModal";
import type { LetterAttachmentDTO } from "@/server/types/letter";

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Daftar lampiran pendukung pada halaman detail (warga & petugas). */
export default function LampiranList({
  requestId,
  attachments,
}: {
  requestId: string;
  attachments: LetterAttachmentDTO[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");

  if (attachments.length === 0) return null;

  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="label-doc">Lampiran Pendukung</p>
      <ul className="flex flex-col gap-2 mt-2">
        {attachments.map((a, i) => {
          const targetApiUrl = `/esurat/api/letter-requests/${requestId}/lampiran/${i}`;
          
          // 🔑 CEK APAKAH FILE INI ADALAH PDF
          const isPdf = a.name.toLowerCase().endsWith(".pdf");

          return (
            <li key={`${a.name}-${i}`}>
              {isPdf ? (
                /* 📄 OPSI A: Jika PDF, gunakan tag <a> biasa untuk buka di New Tab */
                <a
                  href={targetApiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between gap-3 border border-line rounded-[4px] bg-card hover:bg-paper2/40 transition-colors px-3.5 py-2.5 group text-left cursor-pointer"
                >
                  <span className="min-w-0 flex items-baseline gap-2.5">
                    <span className="font-mono text-xs text-brass shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium truncate text-ink">{a.name}</span>
                    <span className="text-xs text-inkmut shrink-0">
                      {formatSize(a.size)} (PDF)
                    </span>
                  </span>
                  
                  <span className="text-xs font-semibold text-brass group-hover:underline underline-offset-2 shrink-0">
                    Lihat ↗
                  </span>
                </a>
              ) : (
                /* 🖼️ OPSI B: Jika GAMBAR (PNG/JPG), gunakan <button> untuk buka Modal Popbox */
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(targetApiUrl);
                    setPreviewName(a.name);
                    setModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between gap-3 border border-line rounded-[4px] bg-card hover:bg-paper2/40 transition-colors px-3.5 py-2.5 group text-left cursor-pointer"
                >
                  <span className="min-w-0 flex items-baseline gap-2.5">
                    <span className="font-mono text-xs text-brass shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium truncate text-ink">{a.name}</span>
                    <span className="text-xs text-inkmut shrink-0">
                      {formatSize(a.size)}
                    </span>
                  </span>
                  
                  <span className="text-xs font-semibold text-brass group-hover:underline underline-offset-2 shrink-0">
                    Lihat →
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Komponen Modal yang hanya dipicu oleh file gambar */}
      <PreviewModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        fileUrl={previewUrl} 
        fileName={previewName}
      />
    </div>
  );
}