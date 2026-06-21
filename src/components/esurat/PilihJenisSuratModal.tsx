"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import type { LetterTypeDTO } from "@/server/types/letter";

interface PilihJenisSuratModalProps {
  types: LetterTypeDTO[];
  /** Halaman tujuan saat modal ditutup (mis. dashboard atau daftar permohonan) — dipakai saat modal adalah halamannya sendiri. */
  closeHref?: string;
  /** Dipanggil saat modal ditutup — dipakai saat modal dipicu dari tombol di halaman lain (tanpa navigasi). */
  onClose?: () => void;
  /** Prefix path form per jenis surat; tiap kartu mengarah ke `${typeBasePath}/${type.id}`. */
  typeBasePath: string;
  /** ID jenis surat yang masih punya pengajuan berjalan milik warga ini — kartu tidak bisa diklik masuk, tampilkan pesan saja. */
  blockedTypeIds?: string[];
}

/** Modal pilih jenis surat: tiap kartu mengarah ke form sesuai jenisnya. */
export default function PilihJenisSuratModal({
  types,
  closeHref,
  onClose,
  typeBasePath,
  blockedTypeIds,
}: PilihJenisSuratModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Kunci scroll background selama modal terbuka
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const close = () => (onClose ? onClose() : closeHref && router.push(closeHref));

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-8 antialiased"
      onClick={close}
    >
      <div
        className="bg-paper w-full max-w-xl max-h-[85vh] rounded-lg shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line shrink-0">
          <div className="min-w-0">
            <p className="overline-doc !text-inkmut">Formulir Permohonan</p>
            <h2 className="font-serif text-xl font-medium text-pine-900 mt-0.5">
              Pilih Jenis Surat
            </h2>
          </div>
          <button
            onClick={close}
            className="text-inkmut hover:text-ink text-xl font-medium transition-colors p-2 leading-none"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {types.length === 0 ? (
            <p className="text-sm text-inkmut text-center py-8">
              Belum ada jenis surat yang tersedia saat ini.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {types.map((t) => {
                const blocked = blockedTypeIds?.includes(t.id);
                const card = (
                  <>
                    <p className="overline-doc !text-brass">{t.code}</p>
                    <p className="font-serif text-base font-medium text-pine-900 mt-1">
                      {t.name}
                    </p>
                    {blocked ? (
                      <p className="text-xs text-oxide mt-1.5 leading-relaxed">
                        Sudah diajuan. Menunggu persetujuan pengajuan sebelumnya
                      </p>
                    ) : (
                      t.description && (
                        <p className="text-xs text-inkmut mt-1.5 leading-relaxed line-clamp-2">
                          {t.description}
                        </p>
                      )
                    )}
                  </>
                );

                if (blocked) {
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        toast(
                          `Masih ada pengajuan ${t.name} yang belum disetujui. Tunggu sampai disetujui sebelum mengajukan lagi.`,
                          "Belum Bisa Mengajukan",
                          "error",
                          5000,
                        )
                      }
                      className="card-doc text-left p-4 border border-line/70 rounded-sm opacity-60 hover:opacity-80 transition-all cursor-not-allowed"
                    >
                      {card}
                    </button>
                  );
                }

                return (
                  <Link
                    key={t.id}
                    href={`${typeBasePath}/${t.id}`}
                    className="card-doc text-left p-4 border border-line/70 rounded-sm hover:border-brass hover:shadow-sm transition-all"
                  >
                    {card}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
