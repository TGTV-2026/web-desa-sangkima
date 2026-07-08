"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { PpidContent } from "@/server/types/content";
import { saveSection } from "../../actions";

export default function PpidSettingsEditor({
  initial,
}: {
  initial: PpidContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [ringkasan, setRingkasan] = useState(initial.ringkasan);
  const [tugas, setTugas] = useState<string[]>(initial.tugas);
  const [prosedur, setProsedur] = useState<string[]>(initial.prosedur);
  const [waktuLayanan, setWaktuLayanan] = useState(initial.waktuLayanan);
  const [kontakNama, setKontakNama] = useState(initial.kontakNama);
  const [kontakTelepon, setKontakTelepon] = useState(initial.kontakTelepon);
  const [kontakEmail, setKontakEmail] = useState(initial.kontakEmail);
  const [kontakAlamat, setKontakAlamat] = useState(initial.kontakAlamat);

  function updateAt(
    list: string[],
    setList: (v: string[]) => void,
    i: number,
    val: string,
  ) {
    const next = [...list];
    next[i] = val;
    setList(next);
  }

  function save() {
    startTransition(async () => {
      const res = await saveSection("ppid", {
        ringkasan: ringkasan.trim(),
        tugas: tugas.map((s) => s.trim()).filter(Boolean),
        prosedur: prosedur.map((s) => s.trim()).filter(Boolean),
        waktuLayanan: waktuLayanan.trim(),
        kontakNama: kontakNama.trim(),
        kontakTelepon: kontakTelepon.trim(),
        kontakEmail: kontakEmail.trim(),
        kontakAlamat: kontakAlamat.trim(),
      });
      if (res.success) {
        toast("Halaman PPID disimpan.", "Tersimpan", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Ringkasan */}
      <section className="card-doc p-6">
        <label className="label-doc" htmlFor="ringkasan">
          Ringkasan / Pengantar PPID
        </label>
        <textarea
          id="ringkasan"
          value={ringkasan}
          onChange={(e) => setRingkasan(e.target.value)}
          rows={4}
          className="input-doc mt-2 w-full resize-y"
          placeholder="Paragraf pengantar halaman PPID…"
        />
      </section>

      <ListEditor
        title="Tugas PPID"
        hint="Tiap kotak = satu poin tugas."
        items={tugas}
        addLabel="Tambah tugas"
        placeholder="Tulis satu poin tugas PPID…"
        onChange={(i, v) => updateAt(tugas, setTugas, i, v)}
        onRemove={(i) => setTugas(tugas.filter((_, idx) => idx !== i))}
        onAdd={() => setTugas([...tugas, ""])}
      />

      <ListEditor
        title="Prosedur Permohonan Informasi"
        hint="Tiap kotak = satu langkah (urut)."
        items={prosedur}
        addLabel="Tambah langkah"
        placeholder="Tulis satu langkah prosedur…"
        onChange={(i, v) => updateAt(prosedur, setProsedur, i, v)}
        onRemove={(i) => setProsedur(prosedur.filter((_, idx) => idx !== i))}
        onAdd={() => setProsedur([...prosedur, ""])}
      />

      {/* Jangka waktu & kontak */}
      <section className="card-doc flex flex-col gap-4 p-6">
        <div>
          <label className="label-doc text-xs">Jangka waktu layanan</label>
          <input
            className="input-doc mt-1 w-full"
            value={waktuLayanan}
            onChange={(e) => setWaktuLayanan(e.target.value)}
          />
        </div>
        <div className="h-px w-full bg-line" />
        <span className="label-doc">Kontak PPID</span>
        <div>
          <label className="label-doc text-xs">Nama unit / pejabat</label>
          <input
            className="input-doc mt-1 w-full"
            value={kontakNama}
            onChange={(e) => setKontakNama(e.target.value)}
            placeholder="mis. PPID Desa Sangkima"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="label-doc text-xs">Telepon</label>
            <input
              className="input-doc mt-1 w-full"
              value={kontakTelepon}
              onChange={(e) => setKontakTelepon(e.target.value)}
              placeholder="mis. 0812-xxxx-xxxx"
            />
          </div>
          <div>
            <label className="label-doc text-xs">Email</label>
            <input
              className="input-doc mt-1 w-full"
              value={kontakEmail}
              onChange={(e) => setKontakEmail(e.target.value)}
              placeholder="ppid@sangkima.desa.id"
            />
          </div>
        </div>
        <div>
          <label className="label-doc text-xs">Alamat</label>
          <input
            className="input-doc mt-1 w-full"
            value={kontakAlamat}
            onChange={(e) => setKontakAlamat(e.target.value)}
          />
        </div>
      </section>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
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

// Editor daftar teks (string[]) dengan tambah/hapus sederhana.
function ListEditor({
  title,
  hint,
  items,
  addLabel,
  placeholder,
  onChange,
  onRemove,
  onAdd,
}: {
  title: string;
  hint: string;
  items: string[];
  addLabel: string;
  placeholder: string;
  onChange: (i: number, v: string) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className="card-doc p-6">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="label-doc">{title}</span>
        <span className="text-[11px] text-inkmut">{hint}</span>
      </div>
      <div className="mt-3 flex flex-col gap-3">
        {items.map((val, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-3 w-6 shrink-0 text-right font-mono text-xs text-inkmut">
              {i + 1}.
            </span>
            <textarea
              value={val}
              onChange={(e) => onChange(i, e.target.value)}
              rows={2}
              className="input-doc w-full resize-y"
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Hapus"
              className="btn-danger mt-1 shrink-0 px-3 py-2 text-xs"
            >
              Hapus
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-inkmut">Belum ada item.</p>
        )}
      </div>
      <button type="button" onClick={onAdd} className="btn-outline mt-4 text-xs">
        + {addLabel}
      </button>
    </section>
  );
}
