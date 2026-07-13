"use client";

import FormField from "@/components/esurat/FormField";
import type { SupportingDoc } from "@/server/types/letter";

/**
 * Repeater dokumen pendukung. Sengaja tanpa tombol ubah-urutan: index array =
 * docIndex yang dirujuk lampiran pengajuan lama, mengacak urutan merusak rujukan.
 */
export default function SupportingDocsBuilder({
  docs,
  onChange,
}: {
  docs: SupportingDoc[];
  onChange: (docs: SupportingDoc[]) => void;
}) {
  const update = (i: number, patch: Partial<SupportingDoc>) =>
    onChange(docs.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  return (
    <div className="flex flex-col gap-3">
      {docs.map((d, i) => (
        <div key={i} className="flex items-end gap-3 border border-line rounded-[4px] bg-paper2/30 p-3.5">
          <span className="font-mono text-xs text-brass pb-3 shrink-0">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <FormField
              id={`doc-label-${i}`}
              label="Nama dokumen"
              value={d.label}
              onChange={(v) => update(i, { label: v })}
              placeholder="mis. Fotokopi KTP pemohon"
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm pb-3 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={d.required}
              onChange={(e) => update(i, { required: e.target.checked })}
              className="accent-pine-700 w-4 h-4"
            />
            Wajib
          </label>
          <button
            type="button"
            onClick={() => onChange(docs.filter((_, idx) => idx !== i))}
            className="btn-danger !px-2.5 !py-1 text-xs mb-2.5"
          >
            Hapus
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...docs, { label: "", required: true }])}
        className="btn-outline self-start"
      >
        + Tambah Dokumen
      </button>
    </div>
  );
}
