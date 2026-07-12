"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { bulkCreateRtFromCsv, type BulkRtActionResult } from "./actions";

const CONTOH_CSV = `nama,email,dusun,rt,sandi
Budi Santoso,budi@example.com,Lestari Jaya,05,sandi-awal-123
Siti Aminah,siti@example.com,Dusun Patra,01,sandi-awal-456`;

// Unggah CSV untuk membuat akun Ketua RT massal. Sandi di CSV hanya sementara
// (akun dipaksa ganti saat login pertama) — tapi tetap plaintext di file, jadi
// operator diingatkan menghapus file CSV-nya setelah selesai.
export default function BulkRtUpload() {
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [hasil, setHasil] = useState<
    Extract<BulkRtActionResult, { success: true }>["hasil"] | null
  >(null);

  function pilihFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      startTransition(async () => {
        const res = await bulkCreateRtFromCsv(text);
        if (res.success) {
          setHasil(res.hasil);
          const n = res.hasil.dibuat.length;
          const g = res.hasil.gagal.length;
          toast(
            `${n} akun dibuat${g ? `, ${g} baris gagal` : ""}.`,
            "CSV diproses",
            g ? "error" : "success",
          );
          router.refresh();
        } else {
          setHasil(null);
          toast(res.message, "Gagal", "error");
        }
      });
    };
    reader.readAsText(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function unduhContoh() {
    const blob = new Blob([CONTOH_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contoh-akun-rt.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="card-doc flex flex-col gap-4 p-5">
      <div>
        <span className="label-doc">Buat Akun Ketua RT (CSV)</span>
        <p className="mt-1 text-[11px] leading-5 text-inkmut">
          Kolom wajib: <code className="font-mono">nama,email,dusun,rt,sandi</code>.
          Sandi di CSV bersifat <span className="font-semibold">sementara</span> —
          tiap ketua RT wajib menggantinya saat login pertama. Setelah selesai,
          hapus file CSV Anda karena berisi sandi.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => pilihFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="btn-primary text-xs disabled:opacity-50"
        >
          {pending ? "Memproses…" : "Unggah CSV"}
        </button>
        <button type="button" onClick={unduhContoh} className="btn-outline text-xs">
          Unduh contoh CSV
        </button>
      </div>

      {hasil && (
        <div className="flex flex-col gap-2 text-sm">
          {hasil.dibuat.length > 0 && (
            <div className="rounded-sm border border-pine-800/30 bg-pine-800/5 px-3 py-2">
              <span className="font-semibold text-pine-900">
                {hasil.dibuat.length} akun dibuat:
              </span>{" "}
              <span className="text-ink">
                {hasil.dibuat
                  .map((d) => `${d.nama} (RT ${d.rt} ${d.dusun})`)
                  .join(", ")}
              </span>
            </div>
          )}
          {hasil.gagal.length > 0 && (
            <div className="rounded-sm border border-oxide/40 bg-oxide/5 px-3 py-2">
              <span className="font-semibold text-oxide">
                {hasil.gagal.length} baris gagal:
              </span>
              <ul className="mt-1 list-inside list-disc text-ink">
                {hasil.gagal.map((g) => (
                  <li key={g.baris}>
                    Baris {g.baris}: {g.alasan}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
