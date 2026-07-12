import Link from "next/link";
import {
  ACTOR_TYPES,
  AUDIT_ACTION_GROUPS,
  AUDIT_ACTION_LABELS,
  type AuditFilter,
} from "@/server/types/activityLog";

const ACTOR_LABELS: Record<(typeof ACTOR_TYPES)[number], string> = {
  warga: "Warga (E-Surat)",
  cms: "CMS / RT",
  system: "Sistem",
};

// Filter audit = form GET biasa (tanpa JS): submit menyetel query string,
// Server Component membacanya ulang. Tombol "Reset" hanya link ke /admin/audit.
export default function AuditFilters({ current }: { current: AuditFilter }) {
  return (
    <form
      method="get"
      action="/admin/audit"
      className="card-doc grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div>
        <label className="label-doc text-xs">Jenis akun</label>
        <select
          name="actorType"
          defaultValue={current.actorType ?? ""}
          className="input-doc mt-1 w-full"
        >
          <option value="">Semua</option>
          {ACTOR_TYPES.map((t) => (
            <option key={t} value={t}>
              {ACTOR_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-2 lg:col-span-1">
        <label className="label-doc text-xs">Aksi</label>
        <select
          name="action"
          defaultValue={current.action ?? ""}
          className="input-doc mt-1 w-full"
        >
          <option value="">Semua aksi</option>
          {AUDIT_ACTION_GROUPS.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.actions.map((a) => (
                <option key={a} value={a}>
                  {AUDIT_ACTION_LABELS[a] ?? a}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label className="label-doc text-xs">Dari tanggal</label>
        <input
          type="date"
          name="from"
          defaultValue={current.from ?? ""}
          className="input-doc mt-1 w-full"
        />
      </div>
      <div>
        <label className="label-doc text-xs">Sampai tanggal</label>
        <input
          type="date"
          name="to"
          defaultValue={current.to ?? ""}
          className="input-doc mt-1 w-full"
        />
      </div>

      <div className="flex flex-col">
        <label className="label-doc text-xs">Kata kunci</label>
        <input
          type="text"
          name="q"
          defaultValue={current.q ?? ""}
          placeholder="nama, ringkasan…"
          className="input-doc mt-1 w-full"
        />
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
        <button type="submit" className="btn-primary text-xs">
          Terapkan Filter
        </button>
        <Link href="/admin/audit" className="btn-outline text-xs">
          Reset
        </Link>
      </div>
    </form>
  );
}
