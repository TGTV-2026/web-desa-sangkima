"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  PPID_CATEGORIES,
  type PpidCategory,
  type PpidDocDTO,
} from "@/server/types/ppid";
import { Download, ExternalLink, Eye, FileText } from "./icons";

// Penjelajah Informasi Publik: daftar "Jenis Informasi Publik" (4 kategori)
// di kiri, dokumen kategori terpilih di kanan. Mengikuti tata letak pada desain.
export default function PpidCategories({ docs }: { docs: PpidDocDTO[] }) {
  const [active, setActive] = useState<PpidCategory>(PPID_CATEGORIES[0].key);
  // Dokumen yang sedang dipratinjau inline (hanya berkas unggahan same-origin).
  const [preview, setPreview] = useState<PpidDocDTO | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Kunci scroll latar saat modal terbuka + tutup dengan Esc.
  useEffect(() => {
    if (!preview) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPreview(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [preview]);

  const countOf = (key: string) => docs.filter((d) => d.category === key).length;
  const shown = docs.filter((d) => d.category === active);
  const activeMeta = PPID_CATEGORIES.find((c) => c.key === active)!;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
      {/* Daftar jenis informasi */}
      <aside>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
          Jenis Informasi Publik
        </span>
        <div className="mt-4 flex flex-col gap-2">
          {PPID_CATEGORIES.map((c) => {
            const isActive = c.key === active;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setActive(c.key)}
                className={`flex items-center justify-between gap-3 rounded-sm border px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "border-pine-900 bg-pine-900 text-paper"
                    : "border-line bg-card text-ink hover:border-pine-900/40 hover:bg-paper2/50"
                }`}
              >
                <span className="text-sm font-semibold">{c.label}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isActive ? "bg-paper/20 text-paper" : "bg-paper2 text-inkmut"
                  }`}
                >
                  {countOf(c.key)}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Dokumen kategori terpilih */}
      <div>
        <h2 className="font-serif text-[26px] font-medium leading-tight text-pine-900">
          {activeMeta.label}
        </h2>
        <p className="mt-2 text-sm leading-6 text-inkmut">{activeMeta.desc}</p>

        <div className="mt-6 flex flex-col gap-3">
          {shown.length === 0 ? (
            <p className="rounded-sm border border-dashed border-line bg-paper2/30 px-5 py-10 text-center text-sm text-inkmut">
              Belum ada dokumen pada kategori ini.
            </p>
          ) : (
            shown.map((d) => {
              // Berkas unggahan (same-origin) bisa dipratinjau inline; tautan luar tidak.
              const canPreview = Boolean(d.fileUrl);
              return (
                <div
                  key={d.id}
                  className="flex items-start gap-4 rounded-sm border border-line bg-card p-4 transition-shadow hover:shadow-sm"
                >
                  <span className="mt-0.5 shrink-0 text-pine-800">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink">{d.title}</h3>
                      {d.year && (
                        <span className="shrink-0 rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-inkmut">
                          {d.year}
                        </span>
                      )}
                    </div>
                    {d.description && (
                      <p className="mt-1 text-sm leading-6 text-inkmut">
                        {d.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row">
                    {canPreview ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPreview(d)}
                          className="btn-primary gap-1.5 text-xs"
                        >
                          <Eye className="h-4 w-4" /> Lihat
                        </button>
                        <a
                          href={d.fileUrl!}
                          download
                          className="btn-outline gap-1.5 text-xs"
                        >
                          <Download className="h-4 w-4" /> Unduh
                        </a>
                      </>
                    ) : (
                      <a
                        href={d.externalUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline gap-1.5 text-xs"
                      >
                        <ExternalLink className="h-4 w-4" /> Buka
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal pratinjau berkas (inline, tanpa wajib unduh) */}
      {mounted &&
        preview &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-6"
            onClick={() => setPreview(null)}
          >
            <div
              className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-inkmut">
                    Informasi Publik
                  </p>
                  <h3 className="truncate font-serif text-lg text-ink">
                    {preview.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={preview.fileUrl!}
                    download
                    className="btn-outline text-xs"
                  >
                    Unduh
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
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
                  src={preview.fileUrl!}
                  title={`Pratinjau: ${preview.title}`}
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
