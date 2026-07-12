"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { formatTanggalWaktu } from "@/lib/format";
import {
  AGAMA,
  KEADAAN_PENDUDUK,
  KELOMPOK_UMUR,
  PEKERJAAN,
  PENDIDIKAN_BERJALAN,
  PENDIDIKAN_TAMAT,
  POTENSI_SEKSI,
  STATUS_KAWIN,
  SUKU,
  laporanKosong,
  type LkPr,
  type RtReportDTO,
  type RtReportData,
  type RtSessionDTO,
} from "@/server/types/rtReport";
import { simpanLaporanSaya } from "./actions";

// Nama bagian kependudukan yang berbentuk Record<kategori, LkPr>.
type BagianLkPr =
  | "keadaanPenduduk"
  | "umur"
  | "suku"
  | "agama"
  | "pekerjaan"
  | "statusKawin"
  | "pendidikanTamat"
  | "pendidikanBerjalan";

function InputAngka({
  value,
  onChange,
  readOnly,
  desimal,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly?: boolean;
  desimal?: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      step={desimal ? "0.01" : "1"}
      inputMode="numeric"
      value={value}
      disabled={readOnly}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) && n >= 0 ? n : 0);
      }}
      onFocus={(e) => e.target.select()}
      className="input-doc w-20 px-2 py-1 text-right text-sm disabled:opacity-70"
    />
  );
}

/** Tabel satu bagian Lk/Pr — kolom Jml dihitung, baris total di bawah. */
function TabelLkPr({
  judul,
  keterangan,
  kunci,
  nilai,
  onSet,
  readOnly,
  terbuka,
}: {
  judul: string;
  keterangan?: string;
  kunci: readonly string[];
  nilai: Record<string, LkPr>;
  onSet: (kategori: string, kolom: "lk" | "pr", v: number) => void;
  readOnly?: boolean;
  terbuka?: boolean;
}) {
  const totalLk = kunci.reduce((s, k) => s + (nilai[k]?.lk ?? 0), 0);
  const totalPr = kunci.reduce((s, k) => s + (nilai[k]?.pr ?? 0), 0);
  return (
    <details className="card-doc" open={terbuka}>
      <summary className="cursor-pointer select-none px-5 py-4">
        <span className="font-serif text-lg text-pine-900">{judul}</span>
        <span className="ml-3 text-[11px] text-inkmut">
          Total: {totalLk + totalPr} jiwa
        </span>
        {keterangan && (
          <span className="mt-1 block text-[11px] text-inkmut">{keterangan}</span>
        )}
      </summary>
      <div className="overflow-x-auto border-t border-line px-5 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-inkmut">
              <th className="py-1 pr-3 font-semibold">Kategori</th>
              <th className="w-24 py-1 pr-3 font-semibold">Lk</th>
              <th className="w-24 py-1 pr-3 font-semibold">Pr</th>
              <th className="w-16 py-1 font-semibold">Jml</th>
            </tr>
          </thead>
          <tbody>
            {kunci.map((k) => {
              const v = nilai[k] ?? { lk: 0, pr: 0 };
              return (
                <tr key={k} className="border-t border-line/60">
                  <td className="py-1.5 pr-3 text-ink">{k}</td>
                  <td className="py-1.5 pr-3">
                    <InputAngka value={v.lk} readOnly={readOnly} onChange={(n) => onSet(k, "lk", n)} />
                  </td>
                  <td className="py-1.5 pr-3">
                    <InputAngka value={v.pr} readOnly={readOnly} onChange={(n) => onSet(k, "pr", n)} />
                  </td>
                  <td className="py-1.5 font-semibold text-pine-900">{v.lk + v.pr}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-line font-semibold">
              <td className="py-2 pr-3 text-ink">Jumlah</td>
              <td className="py-2 pr-3 text-right text-pine-900">{totalLk}</td>
              <td className="py-2 pr-3 text-right text-pine-900">{totalPr}</td>
              <td className="py-2 text-pine-900">{totalLk + totalPr}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}

export default function LaporanForm({
  session,
  report,
  namaKetua,
  dusun,
  rt,
  readOnly,
}: {
  session: RtSessionDTO;
  report: RtReportDTO | null;
  namaKetua: string;
  dusun: string;
  rt: string;
  readOnly?: boolean;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<RtReportData>(
    () => report?.data ?? laporanKosong(),
  );

  function setLkPr(bagian: BagianLkPr, kategori: string, kolom: "lk" | "pr", v: number) {
    setData((d) => ({
      ...d,
      kependudukan: {
        ...d.kependudukan,
        [bagian]: {
          ...d.kependudukan[bagian],
          [kategori]: { ...d.kependudukan[bagian][kategori], [kolom]: v },
        },
      },
    }));
  }

  function setPotensi(judul: string, item: string, v: number) {
    setData((d) => ({
      ...d,
      potensi: {
        ...d.potensi,
        [judul]: { ...d.potensi[judul], [item]: v },
      },
    }));
  }

  function setWalet(i: number, kolom: "namaPemilik" | "alamat" | "hasilKg", v: string | number) {
    setData((d) => {
      const rows = [...d.kependudukan.sarangWalet];
      rows[i] = { ...rows[i], [kolom]: v };
      return { ...d, kependudukan: { ...d.kependudukan, sarangWalet: rows } };
    });
  }

  function tambahWalet() {
    setData((d) => ({
      ...d,
      kependudukan: {
        ...d.kependudukan,
        sarangWalet: [
          ...d.kependudukan.sarangWalet,
          { namaPemilik: "", alamat: "", hasilKg: 0 },
        ],
      },
    }));
  }

  function hapusWalet(i: number) {
    setData((d) => ({
      ...d,
      kependudukan: {
        ...d.kependudukan,
        sarangWalet: d.kependudukan.sarangWalet.filter((_, idx) => idx !== i),
      },
    }));
  }

  function simpan() {
    startTransition(async () => {
      const res = await simpanLaporanSaya(data);
      if (res.success) {
        toast(
          report
            ? "Perubahan laporan tersimpan."
            : "Laporan berhasil dikumpulkan.",
          "Tersimpan",
          "success",
        );
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  const k = data.kependudukan;

  return (
    <div className="flex flex-col gap-4">
      {/* Identitas & jejak waktu */}
      <div className="card-doc flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <span className="overline-doc text-brass">
            Periode {session.bulanLabel} {session.tahun}
          </span>
          <div className="mt-1 font-serif text-xl text-pine-900">
            RT {rt} — {dusun}
          </div>
          <div className="text-sm text-inkmut">Ketua RT: {namaKetua}</div>
        </div>
        <div className="text-right text-[11px] leading-5 text-inkmut">
          {report ? (
            <>
              <div>
                Dikumpulkan:{" "}
                <span className="font-semibold text-ink">
                  {formatTanggalWaktu(report.dikumpulkanPada)}
                </span>
              </div>
              <div>
                Terakhir diedit:{" "}
                <span className="font-semibold text-ink">
                  {formatTanggalWaktu(report.diperbaruiPada)}
                </span>
              </div>
            </>
          ) : (
            !readOnly && <div>Belum dikumpulkan untuk periode ini.</div>
          )}
        </div>
      </div>

      {/* ===== Laporan Kependudukan ===== */}
      <h2 className="mt-2 font-serif text-lg text-pine-900">
        I. Laporan Kependudukan
      </h2>

      <TabelLkPr
        judul="A. Keadaan Penduduk"
        keterangan="KK dipecah menurut kepala keluarganya laki-laki/perempuan."
        kunci={KEADAAN_PENDUDUK}
        nilai={k.keadaanPenduduk}
        onSet={(kat, kol, v) => setLkPr("keadaanPenduduk", kat, kol, v)}
        readOnly={readOnly}
        terbuka
      />
      <TabelLkPr
        judul="B. Umur"
        keterangan="72 kelompok umur — dari 0-12 bulan sampai 71+ tahun."
        kunci={KELOMPOK_UMUR}
        nilai={k.umur}
        onSet={(kat, kol, v) => setLkPr("umur", kat, kol, v)}
        readOnly={readOnly}
      />
      <TabelLkPr
        judul="C. Suku"
        kunci={SUKU}
        nilai={k.suku}
        onSet={(kat, kol, v) => setLkPr("suku", kat, kol, v)}
        readOnly={readOnly}
      />
      <TabelLkPr
        judul="D. Agama"
        kunci={AGAMA}
        nilai={k.agama}
        onSet={(kat, kol, v) => setLkPr("agama", kat, kol, v)}
        readOnly={readOnly}
      />
      <TabelLkPr
        judul="E. Pekerjaan"
        kunci={PEKERJAAN}
        nilai={k.pekerjaan}
        onSet={(kat, kol, v) => setLkPr("pekerjaan", kat, kol, v)}
        readOnly={readOnly}
      />
      <TabelLkPr
        judul="F. Status Perkawinan"
        kunci={STATUS_KAWIN}
        nilai={k.statusKawin}
        onSet={(kat, kol, v) => setLkPr("statusKawin", kat, kol, v)}
        readOnly={readOnly}
      />

      {/* G. Sarang walet — tabel bebas, bukan Lk/Pr */}
      <details className="card-doc">
        <summary className="cursor-pointer select-none px-5 py-4">
          <span className="font-serif text-lg text-pine-900">
            G. Data Sarang Burung Walet
          </span>
          <span className="ml-3 text-[11px] text-inkmut">
            {k.sarangWalet.length} pemilik
          </span>
        </summary>
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
          {k.sarangWalet.length === 0 && (
            <p className="text-sm text-inkmut">Tidak ada sarang walet di RT ini.</p>
          )}
          {k.sarangWalet.map((row, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <label className="flex flex-1 min-w-40 flex-col gap-1">
                <span className="label-doc text-[10px]">Nama Pemilik</span>
                <input
                  className="input-doc px-2 py-1 text-sm disabled:opacity-70"
                  value={row.namaPemilik}
                  disabled={readOnly}
                  onChange={(e) => setWalet(i, "namaPemilik", e.target.value)}
                />
              </label>
              <label className="flex flex-1 min-w-40 flex-col gap-1">
                <span className="label-doc text-[10px]">Alamat</span>
                <input
                  className="input-doc px-2 py-1 text-sm disabled:opacity-70"
                  value={row.alamat}
                  disabled={readOnly}
                  onChange={(e) => setWalet(i, "alamat", e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="label-doc text-[10px]">Hasil/Tahun (KG)</span>
                <InputAngka
                  value={row.hasilKg}
                  desimal
                  readOnly={readOnly}
                  onChange={(v) => setWalet(i, "hasilKg", v)}
                />
              </label>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => hapusWalet(i)}
                  className="btn-danger px-2 py-1 text-xs"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
          {!readOnly && k.sarangWalet.length < 20 && (
            <button
              type="button"
              onClick={tambahWalet}
              className="btn-outline self-start text-xs"
            >
              + Tambah pemilik
            </button>
          )}
        </div>
      </details>

      <TabelLkPr
        judul="H. Pendidikan (Tamat)"
        kunci={PENDIDIKAN_TAMAT}
        nilai={k.pendidikanTamat}
        onSet={(kat, kol, v) => setLkPr("pendidikanTamat", kat, kol, v)}
        readOnly={readOnly}
      />
      <TabelLkPr
        judul="H. Pendidikan (Masih Menjalani)"
        kunci={PENDIDIKAN_BERJALAN}
        nilai={k.pendidikanBerjalan}
        onSet={(kat, kol, v) => setLkPr("pendidikanBerjalan", kat, kol, v)}
        readOnly={readOnly}
      />

      {/* ===== Laporan Potensi Desa ===== */}
      <h2 className="mt-2 font-serif text-lg text-pine-900">
        II. Laporan Potensi Desa
      </h2>

      {POTENSI_SEKSI.map((seksi, idx) => (
        <details key={seksi.judul} className="card-doc">
          <summary className="cursor-pointer select-none px-5 py-4">
            <span className="font-serif text-lg text-pine-900">
              {idx + 1}. {seksi.judul}
            </span>
          </summary>
          <div className="border-t border-line px-5 py-4">
            <table className="w-full max-w-md text-sm">
              <tbody>
                {seksi.item.map((item) => (
                  <tr key={item} className="border-t border-line/60 first:border-t-0">
                    <td className="py-1.5 pr-3 text-ink">{item}</td>
                    <td className="w-28 py-1.5 text-right">
                      <InputAngka
                        value={data.potensi[seksi.judul]?.[item] ?? 0}
                        desimal={seksi.desimal}
                        readOnly={readOnly}
                        onChange={(v) => setPotensi(seksi.judul, item, v)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}

      {!readOnly && (
        <div className="sticky bottom-4 mt-2 flex justify-end">
          <button
            type="button"
            onClick={simpan}
            disabled={pending}
            className="btn-primary shadow-lg disabled:opacity-50"
          >
            {pending
              ? "Menyimpan…"
              : report
                ? "Simpan Perubahan"
                : "Kumpulkan Laporan"}
          </button>
        </div>
      )}
    </div>
  );
}
