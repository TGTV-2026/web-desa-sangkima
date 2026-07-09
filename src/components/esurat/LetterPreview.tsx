"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface LetterPreviewProps {
  requestId: string;
  // true jika surat sudah DISETUJUI/SELESAI (tampilkan tombol unduh PDF resmi).
  issued: boolean;
  // Berubah saat data surat berubah → paksa iframe muat ulang (mis. staff edit isian).
  refreshKey: string;
}

/**
 * Pratinjau surat: thumbnail iframe + tombol "Lihat Surat" yang membuka
 * pratinjau layar penuh (modal). Warga/petugas bisa membaca surat tanpa
 * wajib mengunduh; unduh PDF tetap tersedia untuk surat yang sudah terbit.
 */
export default function LetterPreview({
  requestId,
  issued,
  refreshKey,
}: LetterPreviewProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const previewUrl = `/esurat/api/letter-requests/${requestId}/preview`;
  const pdfUrl = `/esurat/api/letter-requests/${requestId}/pdf`;

  useEffect(() => setMounted(true), []);

  // Kunci scroll latar saat modal terbuka + tutup dengan Esc.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div>
      <p className="label-doc">{issued ? "Surat Terbit" : "Pratinjau Surat"}</p>

      {/* Thumbnail — seluruh area bisa diklik untuk memperbesar */}
      <div className="relative mt-3 group">
        <iframe
          key={refreshKey}
          src={previewUrl}
          title="Pratinjau surat"
          className="w-full aspect-[210/297] border border-line rounded-sm bg-paper2/20 pointer-events-none"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Perbesar pratinjau surat"
          className="absolute inset-0 flex items-end justify-center rounded-sm transition-colors hover:bg-ink/5"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pine-900 px-4 py-2 text-xs font-semibold text-paper opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Perbesar
          </span>
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-outline w-full text-center"
        >
          Lihat Surat
        </button>
        {issued && (
          <div className="flex flex-col gap-2 mt-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center"
            >
              Unduh Surat (PDF)
            </a>
            <a
              href={`${pdfUrl}?nosig=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline w-full text-center text-xs text-ink/70"
            >
              Cetak Tanpa Tanda Tangan
            </a>
          </div>
        )}
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 antialiased sm:p-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-inkmut">
                    {issued ? "Surat Resmi" : "Pratinjau — belum resmi"}
                  </p>
                  <h3 className="font-serif text-lg text-ink">Pratinjau Surat</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline hidden text-xs sm:inline-flex"
                  >
                    Buka di tab baru
                  </a>
                  {issued && (
                    <>
                      <a
                        href={`${pdfUrl}?nosig=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline hidden text-xs sm:inline-flex text-ink/70"
                        title="Unduh Tanpa Tanda Tangan"
                      >
                        Cetak Basah
                      </a>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs"
                      >
                        Unduh
                      </a>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-2 text-2xl leading-none text-inkmut transition-colors hover:text-ink"
                    title="Tutup"
                    aria-label="Tutup"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-paper2/30">
                <iframe
                  key={refreshKey}
                  src={previewUrl}
                  title="Pratinjau surat layar penuh"
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
