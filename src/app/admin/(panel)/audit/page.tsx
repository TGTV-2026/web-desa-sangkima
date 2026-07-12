import Link from "next/link";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { activityLogService } from "@/server/services/activityLog.service";
import {
  auditFilterSchema,
  type ActorType,
  type AuditFilter,
} from "@/server/types/activityLog";
import { formatTanggalWaktu } from "@/lib/format";
import AuditFilters from "./AuditFilters";

export const dynamic = "force-dynamic";

// Ambil hanya nilai string pertama (query bisa berupa array).
function one(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.length ? s : undefined;
}

const ACTOR_BADGE: Record<ActorType, string> = {
  warga: "border-brass/40 bg-brass/10 text-brass",
  cms: "border-pine-700/40 bg-pine-900/5 text-pine-800",
  system: "border-inkmut/30 bg-paper2/60 text-inkmut",
};
const ACTOR_LABEL: Record<ActorType, string> = {
  warga: "Warga",
  cms: "CMS",
  system: "Sistem",
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

export default async function AuditPage({
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
          <span className="overline-doc text-brass">Pengaturan</span>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            Audit Log
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-inkmut">
            Jejak aktivitas akun & data — login, perubahan akun/konten, dan
            tutup-sesi RT — dari sistem warga (E-Surat) maupun CMS. Bersifat baca
            saja.
          </p>
        </div>
        <Link
          href={`/admin/audit/export${buildQuery(filter, 1)}`}
          className="btn-outline text-xs"
          prefetch={false}
        >
          Export CSV
        </Link>
      </div>

      <AuditFilters current={filter} />

      {entries.length === 0 ? (
        <p className="card-doc p-8 text-center text-sm text-inkmut">
          Tidak ada aktivitas untuk filter ini.
        </p>
      ) : (
        <div className="card-doc divide-y divide-line">
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:gap-4"
            >
              <time className="shrink-0 font-mono text-[11px] text-inkmut sm:w-36">
                {formatTanggalWaktu(e.createdAt)}
              </time>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {e.actorType && (
                    <span
                      className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${ACTOR_BADGE[e.actorType]}`}
                    >
                      {ACTOR_LABEL[e.actorType]}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-ink">
                    {e.actorName ?? "—"}
                  </span>
                  <span className="rounded-sm bg-pine-900/5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-pine-800">
                    {e.actionLabel}
                  </span>
                </div>
                <p className="text-sm leading-6 text-ink">{e.summary}</p>
                {e.metadata && Object.keys(e.metadata).length > 0 && (
                  <details className="text-xs text-inkmut">
                    <summary className="cursor-pointer select-none hover:text-pine-900">
                      Detail
                    </summary>
                    <pre className="mt-1 overflow-x-auto rounded-sm border border-line bg-paper2/40 p-2 font-mono text-[11px] text-ink">
                      {JSON.stringify(e.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              <div className="shrink-0 text-right font-mono text-[11px] text-inkmut">
                {e.ipAddress ?? ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginasi */}
      {(page > 1 || hasMore) && (
        <div className="flex items-center justify-between">
          {page > 1 ? (
            <Link
              href={`/admin/audit${buildQuery(filter, page - 1)}`}
              className="btn-outline text-xs"
            >
              ← Sebelumnya
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs text-inkmut">Halaman {page}</span>
          {hasMore ? (
            <Link
              href={`/admin/audit${buildQuery(filter, page + 1)}`}
              className="btn-outline text-xs"
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
