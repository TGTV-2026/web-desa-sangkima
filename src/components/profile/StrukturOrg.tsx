"use client";

import { useState } from "react";
import { Person } from "./icons";
import type { StrukturGroup } from "@/server/types/content";

// Struktur organisasi dengan filter grup: satu bagian yang berubah isi sesuai
// grup terpilih (Aparatur, BPD, LPM, dst.) — tanpa halaman terpisah.
export default function StrukturOrg({ groups }: { groups: StrukturGroup[] }) {
  const [active, setActive] = useState(0);

  if (groups.length === 0) {
    return <p className="text-sm text-inkmut">Belum ada data struktur.</p>;
  }

  const ai = Math.min(active, groups.length - 1);
  const current = groups[ai];

  return (
    <div className="flex flex-col gap-8">
      {/* Filter grup */}
      <div
        role="tablist"
        aria-label="Pilih struktur"
        className="flex flex-wrap gap-2"
      >
        {groups.map((g, i) => {
          const on = i === ai;
          return (
            <button
              key={`${g.label}-${i}`}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(i)}
              className={`rounded-sm border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                on
                  ? "border-pine-900 bg-pine-900 text-paper"
                  : "border-line bg-card text-inkmut hover:border-pine-900/40 hover:text-pine-900"
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Anggota grup terpilih */}
      {current.members.length === 0 ? (
        <p className="text-sm text-inkmut">Belum ada anggota pada grup ini.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {current.members.map((mem, i) => (
            <div
              key={`${mem.jabatan}-${mem.nama}-${i}`}
              className="flex h-full flex-col items-center gap-4 border border-line bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line bg-paper2/40 text-inkmut/40">
                {mem.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mem.foto}
                    alt={`Foto ${mem.nama}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Person className="h-10 w-10" />
                )}
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brass">
                  {mem.jabatan}
                </span>
                <h4 className="font-bold text-ink">{mem.nama}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
