import Link from "next/link";
import { requireMonitoringUser } from "@/server/utils/cmsSession";
import { activityLogService } from "@/server/services/activityLog.service";
import { formatTanggalWaktu } from "@/lib/format";
import {
  ACTOR_TYPE_LABELS,
  type ActivityLogFilter,
  type ActorType,
  type ActionCategory,
} from "@/server/types/activityLog";
import AuditFilterBar from "./AuditFilterBar";

export const dynamic = "force-dynamic";

const PER_PAGE = 50;

// Warna badge aksi: gagal/hapus = oxide (merah), buka publik = brass, selain itu pine.
function badgeClass(action: string): string {
  if (/fail|delete|deactivate/.test(action)) return "border-oxide text-oxide bg-oxide/5";
  if (action === "rt_session.close") return "border-brass text-brass bg-brass/10";
  return "border-pine-800 text-pine-900 bg-pine-800/5";
}

const ACTOR_BADGE: Record<ActorType, string> = {
  cms: "bg-pine-800/10 text-pine-900",
  warga: "bg-brass/10 text-brass",
  system: "bg-paper2 text-inkmut",
};

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireMonitoringUser();
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page) || 1);
  const filter: ActivityLogFilter = {
    actorType: (sp.actorType as ActorType) || undefined,
    category: (sp.category as ActionCategory) || undefined,
    dari: sp.dari ? new Date(sp.dari) : undefined,
    // sampai: akhir hari supaya tanggal itu ikut terhitung
    sampai: sp.sampai ? new Date(`${sp.sampai}T23:59:59`) : undefined,
    q: sp.q || undefined,
    limit: PER_PAGE,
    offset: (page - 1) * PER_PAGE,
  };

  const { items, total } = await activityLogService.list(filter);
  const totalPage = Math.max(1, Math.ceil(total / PER_PAGE));

  // Bangun href halaman lain sambil mempertahankan filter.
  const hrefPage = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") q.set(k, v);
    q.set("page", String(p));
    return `/admin/monitoring/audit?${q.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-line pb-4">
        <span className="overline-doc text-brass">Keamanan &amp; Akuntabilitas</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Log Audit Terpadu
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-inkmut">
          Rekam jejak aktivitas sistem — login, perubahan akun, konten publik,
          sesi Laporan RT, dan permintaan surat — dari akun warga maupun CMS.
          Baca-saja; log tidak bisa diubah dari sini.
        </p>
      </div>

      <AuditFilterBar
        current={{
          actorType: sp.actorType,
          category: sp.category,
          dari: sp.dari,
          sampai: sp.sampai,
          q: sp.q,
        }}
      />

      <div className="card-doc overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-[0.12em] text-inkmut">
              <th className="p-3 font-semibold">Waktu</th>
              <th className="p-3 font-semibold">Aktor</th>
              <th className="p-3 font-semibold">Aksi</th>
              <th className="p-3 font-semibold">Target</th>
              <th className="p-3 font-semibold">Ringkasan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-inkmut">
                  Tidak ada log yang cocok dengan filter.
                </td>
              </tr>
            )}
            {items.map((log) => (
              <tr key={log.id} className="align-top hover:bg-paper2/40">
                <td className="whitespace-nowrap p-3 font-mono text-[11px] text-inkmut">
                  {formatTanggalWaktu(log.createdAt)}
                </td>
                <td className="p-3">
                  <div className="font-semibold text-ink">{log.actorName}</div>
                  <span
                    className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${ACTOR_BADGE[log.actorType]}`}
                  >
                    {ACTOR_TYPE_LABELS[log.actorType]}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${badgeClass(log.action)}`}
                  >
                    {log.actionLabel}
                  </span>
                </td>
                <td className="p-3 font-mono text-[11px] text-ink">{log.target}</td>
                <td className="p-3 text-ink">
                  {log.summary}
                  {log.ipAddress && (
                    <span className="ml-2 font-mono text-[11px] text-inkmut">
                      ({log.ipAddress})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginasi */}
      <div className="flex items-center justify-between text-sm text-inkmut">
        <span>
          Menampilkan {items.length === 0 ? 0 : filter.offset! + 1}–
          {filter.offset! + items.length} dari {total} log
        </span>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link href={hrefPage(page - 1)} className="btn-outline text-xs">
              Sebelumnya
            </Link>
          ) : (
            <span className="btn-outline pointer-events-none text-xs opacity-40">
              Sebelumnya
            </span>
          )}
          <span className="px-2 py-1 text-xs">
            Hal {page} / {totalPage}
          </span>
          {page < totalPage ? (
            <Link href={hrefPage(page + 1)} className="btn-outline text-xs">
              Selanjutnya
            </Link>
          ) : (
            <span className="btn-outline pointer-events-none text-xs opacity-40">
              Selanjutnya
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
