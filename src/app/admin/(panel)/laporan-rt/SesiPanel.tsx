"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { formatTanggalWaktu } from "@/lib/format";
import { BULAN_LABELS, type RtSessionDTO } from "@/server/types/rtReport";
import { bukaSesi, tutupSesi } from "./actions";

export default function SesiPanel({
  sessions,
  jumlahAkunRt,
}: {
  sessions: RtSessionDTO[];
  jumlahAkunRt: number;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const now = new Date();
  const [tahun, setTahun] = useState(String(now.getFullYear()));
  const [bulan, setBulan] = useState(String(now.getMonth() + 1));
  // Konfirmasi tutup sesi lewat state (dua langkah), bukan confirm() native —
  // dialog native memblokir seluruh halaman & tak bisa di-styling.
  const [konfirmTutup, setKonfirmTutup] = useState<string | null>(null);

  const adaAktif = sessions.some((s) => s.active);

  function buka(t: number, b: number) {
    startTransition(async () => {
      const res = await bukaSesi({ tahun: t, bulan: b });
      if (res.success) {
        toast(
          `Sesi ${BULAN_LABELS[b - 1]} ${t} dibuka — ketua RT sudah bisa mengisi.`,
          "Sesi dibuka",
          "success",
        );
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  function tutup(sessionId: string) {
    setKonfirmTutup(null);
    startTransition(async () => {
      const res = await tutupSesi(sessionId);
      if (res.success) {
        toast(
          "Sesi ditutup. Statistik dusun publik sudah diperbarui dari rekap laporan.",
          "Sesi ditutup",
          "success",
        );
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Buka sesi baru */}
      <section className="card-doc flex flex-col gap-3 p-5">
        <div>
          <span className="label-doc">Buka Sesi Pelaporan</span>
          <p className="mt-1 text-[11px] leading-5 text-inkmut">
            Ketua RT hanya bisa mengisi selama ada sesi yang dibuka. Hanya satu
            sesi boleh aktif — tutup sesi berjalan sebelum membuka yang baru.
            Menutup sesi juga menerbitkan rekapnya ke Statistik Dusun publik.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="label-doc text-[10px]">Bulan</span>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="input-doc px-2 py-1.5 text-sm"
            >
              {BULAN_LABELS.map((b, i) => (
                <option key={b} value={i + 1}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-doc text-[10px]">Tahun</span>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="input-doc w-24 px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={pending || adaAktif}
            onClick={() => buka(Number(tahun), Number(bulan))}
            className="btn-primary text-sm disabled:opacity-50"
            title={adaAktif ? "Tutup sesi aktif dulu" : undefined}
          >
            {pending ? "Memproses…" : "Buka Sesi"}
          </button>
        </div>
      </section>

      {/* Daftar sesi */}
      <section className="flex flex-col gap-2">
        {sessions.length === 0 && (
          <p className="card-doc p-5 text-sm text-inkmut">
            Belum ada sesi. Buka sesi pertama di atas untuk mulai menerima
            laporan dari ketua RT.
          </p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            className="card-doc flex flex-col gap-3 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg text-pine-900">
                    {s.bulanLabel} {s.tahun}
                  </span>
                  {s.active ? (
                    <span className="rounded-sm bg-pine-800/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-pine-900">
                      Aktif
                    </span>
                  ) : (
                    <span className="rounded-sm bg-paper2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-inkmut">
                      Ditutup
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-[11px] text-inkmut">
                  {s.jumlahLaporan} dari {jumlahAkunRt} RT sudah setor
                  {s.closedAt && ` · ditutup ${formatTanggalWaktu(s.closedAt)}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/laporan-rt/${s.id}`}
                  className="btn-outline text-xs"
                >
                  Lihat Laporan
                </Link>
                {s.active ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      setKonfirmTutup(konfirmTutup === s.id ? null : s.id)
                    }
                    className="btn-danger text-xs disabled:opacity-50"
                  >
                    Tutup Sesi
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending || adaAktif}
                    onClick={() => buka(s.tahun, s.bulan)}
                    className="btn-outline text-xs disabled:opacity-50"
                    title={adaAktif ? "Tutup sesi aktif dulu" : "Buka lagi untuk RT yang telat setor"}
                  >
                    Buka Ulang
                  </button>
                )}
              </div>
            </div>

            {/* Konfirmasi inline — menutup sesi menerbitkan rekap ke publik */}
            {konfirmTutup === s.id && (
              <div className="rounded-sm border border-oxide/40 bg-oxide/5 px-3 py-2.5 text-sm">
                <p className="text-ink">
                  Tutup sesi <span className="font-semibold">{s.bulanLabel} {s.tahun}</span>?
                  Laporan terkunci ({s.jumlahLaporan} dari {jumlahAkunRt} RT sudah
                  setor) dan rekapnya <span className="font-semibold">langsung
                  memperbarui Statistik Dusun di website publik</span>.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => tutup(s.id)}
                    className="btn-danger text-xs disabled:opacity-50"
                  >
                    {pending ? "Memproses…" : "Ya, Tutup & Terbitkan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setKonfirmTutup(null)}
                    className="btn-outline text-xs"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
