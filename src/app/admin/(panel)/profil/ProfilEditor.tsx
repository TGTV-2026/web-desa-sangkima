"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { ProfilContent } from "@/server/types/content";
import { saveSection } from "../actions";

export default function ProfilEditor({ initial }: { initial: ProfilContent }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [visi, setVisi] = useState(initial.visi);
  const [sejarah, setSejarah] = useState<string[]>(initial.sejarah);
  const [misi, setMisi] = useState<string[]>(initial.misi);

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

  function removeAt(
    list: string[],
    setList: (v: string[]) => void,
    i: number,
  ) {
    setList(list.filter((_, idx) => idx !== i));
  }

  function save() {
    startTransition(async () => {
      const res = await saveSection("profil", {
        visi: visi.trim(),
        sejarah: sejarah.map((s) => s.trim()).filter(Boolean),
        misi: misi.map((s) => s.trim()).filter(Boolean),
      });
      if (res.success) {
        toast("Profil berhasil disimpan.", "Tersimpan", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Visi */}
      <section className="card-doc p-6">
        <label className="label-doc" htmlFor="visi">
          Pernyataan Visi
        </label>
        <textarea
          id="visi"
          value={visi}
          onChange={(e) => setVisi(e.target.value)}
          rows={3}
          className="input-doc mt-2 w-full resize-y"
          placeholder="Tulis pernyataan visi desa…"
        />
      </section>

      {/* Sejarah */}
      <ListEditor
        title="Sejarah Singkat"
        hint="Tiap kotak = satu paragraf."
        items={sejarah}
        rows={4}
        addLabel="Tambah paragraf"
        placeholder="Tulis satu paragraf sejarah…"
        onChange={(i, v) => updateAt(sejarah, setSejarah, i, v)}
        onRemove={(i) => removeAt(sejarah, setSejarah, i)}
        onAdd={() => setSejarah([...sejarah, ""])}
      />

      {/* Misi */}
      <ListEditor
        title="Misi"
        hint="Tiap kotak = satu poin misi (tampil sebagai kartu timeline)."
        items={misi}
        rows={3}
        addLabel="Tambah poin misi"
        placeholder="Tulis satu poin misi…"
        onChange={(i, v) => updateAt(misi, setMisi, i, v)}
        onRemove={(i) => removeAt(misi, setMisi, i)}
        onAdd={() => setMisi([...misi, ""])}
      />

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

// Editor daftar teks (string[]) dengan tambah/hapus/urut sederhana.
function ListEditor({
  title,
  hint,
  items,
  rows,
  addLabel,
  placeholder,
  onChange,
  onRemove,
  onAdd,
}: {
  title: string;
  hint: string;
  items: string[];
  rows: number;
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
              rows={rows}
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
