import Link from "next/link";
import { activityLogService } from "@/server/services/activityLog.service";
import { formatTanggalWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#24323d] bg-[#161f26] p-5">
      <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6b7b88]">
        {label}
      </div>
      <div
        className={`mt-2 text-3xl font-semibold ${
          danger && value > 0 ? "text-[#f87171]" : "text-[#e0e2ea]"
        }`}
      >
        {value.toLocaleString("id-ID")}
      </div>
    </div>
  );
}

export default async function MonitoringOverviewPage() {
  const { stats, recent } = await activityLogService.overview();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#e0e2ea]">Overview</h1>
        <p className="mt-1 text-sm text-[#8b98a5]">
          Ringkasan aktivitas sistem. Data dari audit log aplikasi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total aktivitas" value={stats.total} />
        <StatCard label="Login gagal · 24 jam" value={stats.gagal24} danger />
        <StatCard label="Login berhasil · 24 jam" value={stats.sukses24} />
        <StatCard label="Aktivitas · 7 hari" value={stats.act7} />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8b98a5]">
            Aktivitas Terbaru
          </h2>
          <Link
            href="/admin/monitoring/audit"
            className="text-xs font-semibold text-[#10b981] hover:underline"
          >
            Lihat semua →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-lg border border-[#24323d] bg-[#161f26] p-8 text-center text-sm text-[#6b7b88]">
            Belum ada aktivitas tercatat.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#24323d] bg-[#161f26]">
            {recent.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-3 border-b border-[#24323d] px-4 py-3 last:border-b-0"
              >
                <time className="w-32 shrink-0 font-mono text-[11px] text-[#6b7b88]">
                  {formatTanggalWaktu(e.createdAt)}
                </time>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-[#e0e2ea]">
                      {e.actorName ?? "—"}
                    </span>
                    <span className="rounded bg-[#006c49]/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#10b981]">
                      {e.actionLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#8b98a5]">{e.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
