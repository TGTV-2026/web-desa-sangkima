"use client";

import { useState } from "react";
import FormField from "@/components/esurat/FormField";
import type { LetterFieldDef } from "@/server/types/letter";

const FIELD_TYPES: { value: LetterFieldDef["type"]; label: string }[] = [
  { value: "text", label: "Teks" },
  { value: "textarea", label: "Teks panjang" },
  { value: "number", label: "Angka" },
  { value: "date", label: "Tanggal" },
  { value: "time", label: "Jam" },
  { value: "select", label: "Pilihan" },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Repeater definisi field dinamis jenis surat (label, nama tag, tipe, wajib, opsi). */
export default function FieldBuilder({
  fields,
  onChange,
  warnRename,
}: {
  fields: LetterFieldDef[];
  onChange: (fields: LetterFieldDef[]) => void;
  warnRename: boolean;
}) {
  // index baris yang nama-nya sudah diedit manual — berhenti auto-slug dari label
  const [touched, setTouched] = useState<Set<number>>(new Set());

  const update = (i: number, patch: Partial<LetterFieldDef>) =>
    onChange(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setTouched(new Set());
  };

  const remove = (i: number) => {
    onChange(fields.filter((_, idx) => idx !== i));
    setTouched(new Set());
  };

  const add = () =>
    onChange([...fields, { name: "", label: "", type: "text", required: true }]);

  return (
    <div className="flex flex-col gap-3">
      {fields.map((f, i) => (
        <div key={i} className="border border-line rounded-[4px] bg-paper2/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              id={`field-label-${i}`}
              label="Label (tampil ke warga)"
              value={f.label}
              onChange={(v) =>
                update(i, {
                  label: v,
                  ...(touched.has(i) ? {} : { name: slugify(v) }),
                })
              }
              required
            />
            <FormField
              id={`field-name-${i}`}
              label="Nama tag"
              value={f.name}
              onChange={(v) => {
                setTouched((prev) => new Set(prev).add(i));
                update(i, { name: slugify(v) || v.toLowerCase() });
              }}
              placeholder="mis. nama_usaha"
              required
              inputClassName="font-mono"
            />
          </div>
          {warnRename && (
            <p className="text-[11px] text-oxide mt-1.5">
              Mengubah nama tag memutus tag lama di template DOCX dan data pengajuan
              lama — pastikan template ikut diperbarui.
            </p>
          )}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <FormField
              id={`field-type-${i}`}
              label="Tipe"
              type="select"
              value={f.type}
              onChange={(v) => update(i, { type: v as LetterFieldDef["type"] })}
              options={FIELD_TYPES}
            />
            {f.type === "select" && (
              <FormField
                id={`field-options-${i}`}
                label="Opsi (pisah dengan koma)"
                value={f.options?.join(", ") ?? ""}
                onChange={(v) => update(i, { options: v.split(",").map((s) => s.trim()) })}
                placeholder="mis. Perdagangan, Jasa, Lainnya"
              />
            )}
          </div>
          <div className="mt-3">
            <FormField
              id={`field-placeholder-${i}`}
              label="Catatan / placeholder"
              value={f.placeholder ?? ""}
              onChange={(v) => update(i, { placeholder: v || undefined })}
              optionalHint
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={f.required}
                onChange={(e) => update(i, { required: e.target.checked })}
                className="accent-pine-700 w-4 h-4"
              />
              Wajib diisi
            </label>
            <span className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="btn-outline !px-2.5 !py-1 text-xs disabled:opacity-40"
                aria-label="Naikkan urutan"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === fields.length - 1}
                className="btn-outline !px-2.5 !py-1 text-xs disabled:opacity-40"
                aria-label="Turunkan urutan"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="btn-danger !px-2.5 !py-1 text-xs"
              >
                Hapus
              </button>
            </span>
          </div>
        </div>
      ))}

      <button type="button" onClick={add} className="btn-outline self-start">
        + Tambah Field
      </button>
    </div>
  );
}
