"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { StatistikDusunContent } from "@/server/types/content";
import { saveSection } from "../../actions";

type Dusun = StatistikDusunContent["dusun"][number];

// Input angka: kosongkan saat fokus jika 0 (memudahkan mengetik ulang),
// kembalikan ke 0 saat blur bila dikosongkan.
function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-inkmut">
        {label}
      </label>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="input-doc w-full text-right font-mono"
      />
    </div>
  );
}

export default function StatistikDusunEditor({
  initial,
}: {
  initial: StatistikDusunContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [keterangan, setKeterangan] = useState(initial.keterangan);
  const [dusun, setDusun] = useState<Dusun[]>(initial.dusun);

  function update(i: number, patch: Partial<Dusun>) {
    setDusun((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  }

  const totalPenduduk = dusun.reduce((s, d) => s + d.lakiLaki + d.perempuan, 0);
  const totalKK = dusun.reduce((s, d) => s + d.kk, 0);

  function save() {
    startTransition(async () => {
      const res = await saveSection("statistikDusun", {
        keterangan: keterangan.trim(),
        dusun: dusun
          .map((d) => ({ ...d, nama: d.nama.trim() }))
          .filter((d) => d.nama),
      });
      if (res.success) {
        toast("Statistik dusun disimpan.", "Tersimpan", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Ringkasan langsung terlihat (bantu operator sadar data sudah masuk atau belum) */}
      <section className="card-doc grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-inkmut">
            Jumlah Dusun
          </span>
          <div className="mt-1 font-serif text-2xl text-pine-900">{dusun.length}</div>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-inkmut">
            Total Penduduk
          </span>
          <div className="mt-1 font-serif text-2xl text-pine-900">
            {totalPenduduk.toLocaleString("id-ID")}
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-inkmut">
            Total KK
          </span>
          <div className="mt-1 font-serif text-2xl text-pine-900">
            {totalKK.toLocaleString("id-ID")}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-inkmut">
            Keterangan (opsional)
          </label>
          <input
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="mis. Data per Januari 2026"
            className="input-doc mt-1 w-full text-xs"
          />
        </div>
      </section>

      {/* Daftar dusun */}
      <section className="card-doc p-6">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="label-doc">Data per Dusun</span>
          <span className="text-[11px] text-inkmut">
            Kosongkan angka yang belum diketahui — tampil 0 dulu.
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {dusun.map((d, i) => {
            const total = d.lakiLaki + d.perempuan;
            return (
              <div
                key={i}
                className="flex flex-col gap-3 border border-line bg-paper2/20 p-4 md:flex-row md:items-end"
              >
                <div className="flex-1">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-inkmut">
                    Nama Dusun
                  </label>
                  <input
                    value={d.nama}
                    onChange={(e) => update(i, { nama: e.target.value })}
                    className="input-doc mt-1 w-full"
                    placeholder="Nama dusun"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 md:w-72">
                  <NumberField
                    label="Laki-laki"
                    value={d.lakiLaki}
                    onChange={(v) => update(i, { lakiLaki: v })}
                  />
                  <NumberField
                    label="Perempuan"
                    value={d.perempuan}
                    onChange={(v) => update(i, { perempuan: v })}
                  />
                  <NumberField
                    label="KK"
                    value={d.kk}
                    onChange={(v) => update(i, { kk: v })}
                  />
                </div>
                <div className="flex items-center justify-between gap-3 md:w-auto md:flex-col md:items-end md:gap-1">
                  <span className="font-mono text-xs text-inkmut">
                    Total: <b className="text-ink">{total.toLocaleString("id-ID")}</b> jiwa
                  </span>
                  <button
                    type="button"
                    onClick={() => setDusun((prev) => prev.filter((_, idx) => idx !== i))}
                    className="btn-danger shrink-0 px-3 py-2 text-xs"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
          {dusun.length === 0 && (
            <p className="text-sm text-inkmut">Belum ada data dusun.</p>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setDusun((prev) => [
              ...prev,
              { nama: "", lakiLaki: 0, perempuan: 0, kk: 0 },
            ])
          }
          className="btn-outline mt-4 text-xs"
        >
          + Tambah Dusun
        </button>
      </section>

      <div className="sticky bottom-0 flex justify-end border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
