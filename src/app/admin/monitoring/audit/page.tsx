import Link from "next/link";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { activityLogService } from "@/server/services/activityLog.service";
import {
  ACTOR_TYPES,
  AUDIT_ACTION_GROUPS,
  AUDIT_ACTION_LABELS,
  auditFilterSchema,
  type ActorType,
  type AuditFilter,
} from "@/server/types/activityLog";
import { formatTanggalWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

function one(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.length ? s : undefined;
}

const ACTOR_LABEL: Record<ActorType, string> = {
  warga: "Warga",
  cms: "CMS",
  system: "Sistem",
};
const ACTOR_BADGE: Record<ActorType, string> = {
  warga: "bg-[#5e4200]/25 text-[#e0b44a]",
  cms: "bg-[#006c49]/25 text-[#10b981]",
  system: "bg-[#1d2a34] text-[#8b98a5]",
};

function buildQuery(f: AuditFilter, page: number): string {
  const p = new URLSearchParams();
  if (f.actorType) p.set("actorType", f.actorType);
  if (f.action) p.set("action", f.action);
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (f.q) p.set("q", f.q);
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

const inputCls =
  "mt-1 w-full rounded-md border border-[#24323d] bg-[#101419] px-3 py-2 text-sm text-[#e0e2ea] focus:border-[#10b981] focus:outline-none";
const labelCls = "text-[11px] font-medium uppercase tracking-[0.1em] text-[#6b7b88]";

export default async function MonitoringAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  await requireSuperAdmin();
  const sp = await searchParams;

  const parsed = auditFilterSchema.safeParse({
    actorType: one(sp.actorType),
    action: one(sp.action),
    from: one(sp.from),
    to: one(sp.to),
    q: one(sp.q),
    page: one(sp.page) ?? 1,
  });
  const filter: AuditFilter = parsed.success ? parsed.data : { page: 1 };
  const { entries, page, hasMore } = await activityLogService.list(filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#e0e2ea]">Audit Logs</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#8b98a5]">
            Jejak aktivitas akun & data — login, perubahan akun/konten, tutup-sesi
            RT — dari sistem warga (E-Surat) & CMS. Baca saja.
          </p>
        </div>
        <Link
          href={`/admin/monitoring/audit/export${buildQuery(filter, 1)}`}
          prefetch={false}
          className="rounded-md border border-[#24323d] bg-[#161f26] px-4 py-2 text-xs font-semibold text-[#10b981] hover:bg-[#1c2a34]"
        >
          ↓ Export CSV
        </Link>
      </div>

      {/* Filter — form GET biasa (tanpa JS) */}
      <form
        method="get"
        action="/admin/monitoring/audit"
        className="grid grid-cols-1 gap-4 rounded-lg border border-[#24323d] bg-[#161f26] p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div>
          <label className={labelCls}>Jenis akun</label>
          <select name="actorType" defaultValue={filter.actorType ?? ""} className={inputCls}>
            <option value="">Semua</option>
            {ACTOR_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACTOR_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Aksi</label>
          <select name="action" defaultValue={filter.action ?? ""} className={inputCls}>
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
          <label className={labelCls}>Dari</label>
          <input type="date" name="from" defaultValue={filter.from ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Sampai</label>
          <input type="date" name="to" defaultValue={filter.to ?? ""} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Kata kunci</label>
          <input type="text" name="q" defaultValue={filter.q ?? ""} placeholder="nama, ringkasan…" className={inputCls} />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="rounded-md bg-[#10b981] px-4 py-2 text-xs font-semibold text-[#00281a] hover:bg-[#0ea371]"
          >
            Terapkan Filter
          </button>
          <Link
            href="/admin/monitoring/audit"
            className="rounded-md border border-[#24323d] px-4 py-2 text-xs text-[#8b98a5] hover:text-[#e0e2ea]"
          >
            Reset
          </Link>
        </div>
      </form>

      {entries.length === 0 ? (
        <p className="rounded-lg border border-[#24323d] bg-[#161f26] p-8 text-center text-sm text-[#6b7b88]">
          Tidak ada aktivitas untuk filter ini.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#24323d] bg-[#161f26]">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex flex-col gap-2 border-b border-[#24323d] p-4 last:border-b-0 sm:flex-row sm:items-start sm:gap-4"
            >
              <time className="shrink-0 font-mono text-[11px] text-[#6b7b88] sm:w-36">
                {formatTanggalWaktu(e.createdAt)}
              </time>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {e.actorType && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${ACTOR_BADGE[e.actorType]}`}
                    >
                      {ACTOR_LABEL[e.actorType]}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-[#e0e2ea]">
                    {e.actorName ?? "—"}
                  </span>
                  <span className="rounded bg-[#1c2a34] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#9fb0bd]">
                    {e.actionLabel}
                  </span>
                </div>
                <p className="text-sm text-[#c7d0d9]">{e.summary}</p>
                {e.metadata && Object.keys(e.metadata).length > 0 && (
                  <details className="text-xs text-[#8b98a5]">
                    <summary className="cursor-pointer select-none hover:text-[#10b981]">
                      Detail
                    </summary>
                    <pre className="mt-1 overflow-x-auto rounded-md border border-[#24323d] bg-[#101419] p-2 font-mono text-[11px] text-[#c7d0d9]">
                      {JSON.stringify(e.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              <div className="shrink-0 text-right font-mono text-[11px] text-[#6b7b88]">
                {e.ipAddress ?? ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between text-xs">
          {page > 1 ? (
            <Link
              href={`/admin/monitoring/audit${buildQuery(filter, page - 1)}`}
              className="rounded-md border border-[#24323d] px-3 py-1.5 text-[#8b98a5] hover:text-[#e0e2ea]"
            >
              ← Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[#6b7b88]">Halaman {page}</span>
          {hasMore ? (
            <Link
              href={`/admin/monitoring/audit${buildQuery(filter, page + 1)}`}
              className="rounded-md border border-[#24323d] px-3 py-1.5 text-[#8b98a5] hover:text-[#e0e2ea]"
            >
              Berikutnya →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
