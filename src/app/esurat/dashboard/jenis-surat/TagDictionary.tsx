"use client";

import { useToast } from "@/hooks/useToast";
import { FIXED_LETTER_TAGS, type LetterFieldDef } from "@/server/types/letter";

/** Kamus tag template DOCX: tag tetap + nama field dinamis dari form. */
export default function TagDictionary({ fields }: { fields: LetterFieldDef[] }) {
  const { toast } = useToast();

  const copy = (tag: string) => {
    void navigator.clipboard?.writeText(`{${tag}}`);
    toast(`{${tag}} disalin ke clipboard.`, "Tersalin", "success", 2000);
  };

  const TagRow = ({ tag, label }: { tag: string; label: string }) => (
    <li className="flex items-start gap-2.5">
      <button
        type="button"
        onClick={() => copy(tag)}
        title="Salin tag"
        className="font-mono text-[11px] text-brass border border-line rounded-[3px] bg-card px-1.5 py-0.5 hover:bg-paper2/60 transition-colors shrink-0 cursor-pointer"
      >
        {`{${tag}}`}
      </button>
      <span className="text-[11px] text-inkmut leading-relaxed">{label}</span>
    </li>
  );

  return (
    <section className="card-doc p-6 rise-in" style={{ animationDelay: "60ms" }}>
      <p className="overline-doc mb-1">Kamus Tag</p>
      <p className="text-xs text-inkmut mb-4 leading-relaxed">
        Ketik tag berikut di berkas Word menggantikan data contoh; sistem mengisinya
        otomatis saat surat dirender. Klik tag untuk menyalin.
      </p>

      {fields.filter((f) => f.name).length > 0 && (
        <>
          <p className="label-doc">Field jenis surat ini</p>
          <ul className="flex flex-col gap-1.5 mb-4">
            {fields
              .filter((f) => f.name)
              .map((f) => (
                <TagRow key={f.name} tag={f.name} label={f.label || f.name} />
              ))}
          </ul>
        </>
      )}

      <p className="label-doc">Tag tetap</p>
      <ul className="flex flex-col gap-1.5">
        {FIXED_LETTER_TAGS.map((t) => (
          <TagRow key={t.tag} tag={t.tag} label={t.label} />
        ))}
      </ul>

      <div className="mt-5 border-t border-line pt-4">
        <p className="label-doc">Gambar placeholder</p>
        <p className="text-[11px] text-inkmut leading-relaxed mb-2">
          Sisipkan kedua gambar ini di Word pada posisi QR verifikasi dan tanda
          tangan; ukur & letakkan bebas, jangan mengedit/memotong gambarnya.
        </p>
        <span className="flex flex-wrap gap-2">
          <a href="/esurat/placeholder-qr.png" download className="btn-outline !px-3 !py-1.5 text-xs">
            Unduh placeholder QR
          </a>
          <a href="/esurat/placeholder-ttd.png" download className="btn-outline !px-3 !py-1.5 text-xs">
            Unduh placeholder TTD
          </a>
        </span>
      </div>
    </section>
  );
}
