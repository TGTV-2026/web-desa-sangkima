"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import type { StrukturContent, StrukturGroup } from "@/server/types/content";
import { saveSection } from "../actions";
import ImageUploadField from "../ImageUploadField";

type Member = StrukturGroup["members"][number];

export default function StrukturEditor({
  initial,
}: {
  initial: StrukturContent;
}) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [groups, setGroups] = useState<StrukturGroup[]>(initial.groups);
  const [active, setActive] = useState(0);

  const ai = groups.length ? Math.min(active, groups.length - 1) : 0;
  const current = groups[ai];

  function updateGroup(i: number, patch: Partial<StrukturGroup>) {
    setGroups((prev) => prev.map((g, idx) => (idx === i ? { ...g, ...patch } : g)));
  }
  function updateMember(gi: number, mi: number, patch: Partial<Member>) {
    setGroups((prev) =>
      prev.map((g, idx) =>
        idx === gi
          ? {
              ...g,
              members: g.members.map((mem, j) =>
                j === mi ? { ...mem, ...patch } : mem,
              ),
            }
          : g,
      ),
    );
  }
  function addGroup() {
    setActive(groups.length);
    setGroups((prev) => [...prev, { label: "Grup Baru", members: [] }]);
  }
  function removeGroup(i: number) {
    setGroups((prev) => prev.filter((_, idx) => idx !== i));
    setActive((a) => Math.max(0, a >= i ? a - 1 : a));
  }
  function addMember(gi: number) {
    updateGroup(gi, {
      members: [...groups[gi].members, { jabatan: "", nama: "", foto: "" }],
    });
  }
  function removeMember(gi: number, mi: number) {
    updateGroup(gi, {
      members: groups[gi].members.filter((_, j) => j !== mi),
    });
  }

  function save() {
    startTransition(async () => {
      const payload = {
        groups: groups
          .map((g) => ({
            label: g.label.trim(),
            members: g.members
              .map((mem) => ({
                jabatan: mem.jabatan.trim(),
                nama: mem.nama.trim(),
                foto: mem.foto,
              }))
              .filter((mem) => mem.jabatan && mem.nama),
          }))
          .filter((g) => g.label),
      };
      const res = await saveSection("struktur", payload);
      toast(
        res.success ? "Struktur organisasi disimpan." : res.message,
        res.success ? "Tersimpan" : "Gagal",
        res.success ? "success" : "error",
      );
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter grup + tambah grup */}
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((g, i) => {
          const on = i === ai;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-sm border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                on
                  ? "border-pine-900 bg-pine-900 text-paper"
                  : "border-line bg-card text-inkmut hover:border-pine-900/40 hover:text-pine-900"
              }`}
            >
              {g.label.trim() || "(tanpa nama)"}
            </button>
          );
        })}
        <button type="button" onClick={addGroup} className="btn-outline text-xs">
          + Grup
        </button>
      </div>

      {!current ? (
        <p className="text-sm text-inkmut">
          Belum ada grup. Klik “+ Grup” untuk menambah.
        </p>
      ) : (
        <section className="card-doc flex flex-col gap-4 p-6">
          {/* Header grup: ganti nama + hapus grup */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="label-doc text-xs">Nama grup</label>
              <input
                value={current.label}
                onChange={(e) => updateGroup(ai, { label: e.target.value })}
                className="input-doc mt-1 w-full"
                placeholder="mis. Aparatur Desa, BPD, LPM…"
              />
            </div>
            <button
              type="button"
              onClick={() => removeGroup(ai)}
              className="btn-danger shrink-0 px-4 py-2 text-xs"
            >
              Hapus grup ini
            </button>
          </div>

          {/* Anggota grup */}
          <div className="flex items-baseline justify-between border-t border-line pt-4">
            <span className="label-doc">Anggota</span>
            <span className="text-[11px] text-inkmut">
              Jabatan, nama &amp; foto (opsional).
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {current.members.map((mem, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 border border-line bg-paper2/20 p-4 sm:flex-row sm:items-start"
              >
                <ImageUploadField
                  label="Foto"
                  value={mem.foto}
                  onChange={(url) => updateMember(ai, i, { foto: url })}
                />
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    value={mem.jabatan}
                    onChange={(e) =>
                      updateMember(ai, i, { jabatan: e.target.value })
                    }
                    className="input-doc w-full"
                    placeholder="Jabatan (mis. Ketua BPD, RT 1)"
                  />
                  <input
                    value={mem.nama}
                    onChange={(e) => updateMember(ai, i, { nama: e.target.value })}
                    className="input-doc w-full"
                    placeholder="Nama"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(ai, i)}
                  className="btn-danger shrink-0 px-3 py-2 text-xs"
                >
                  Hapus
                </button>
              </div>
            ))}
            {current.members.length === 0 && (
              <p className="text-sm text-inkmut">Belum ada anggota.</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => addMember(ai)}
            className="btn-outline self-start text-xs"
          >
            + Tambah anggota
          </button>
        </section>
      )}

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
