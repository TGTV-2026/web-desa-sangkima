import Link from "next/link";
import { requireMonitoringUser } from "@/server/utils/cmsSession";
import { activityLogService } from "@/server/services/activityLog.service";
import { formatTanggalWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

const UPTIME_KUMA_URL = process.env.UPTIME_KUMA_URL ?? "";

function StatCard({
  label,
  value,
  sub,
  tone = "pine",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "pine" | "brass" | "oxide";
}) {
  const bar =
    tone === "oxide" ? "bg-oxide" : tone === "brass" ? "bg-brass" : "bg-pine-800";
  return (
    <div className="card-doc relative overflow-hidden p-5">
      <span className={`absolute left-0 top-0 h-full w-1 ${bar}`} />
      <div className="pl-2">
        <div className="font-serif text-3xl text-pine-900">{value}</div>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-inkmut">
          {label}
        </div>
        {sub && <div className="mt-1 text-[11px] text-inkmut">{sub}</div>}
      </div>
    </div>
  );
}

export default async function MonitoringDashboardPage() {
  await requireMonitoringUser();

  const [ringkasan, tren, terbaru] = await Promise.all([
    activityLogService.ringkasan24Jam(),
    activityLogService.trenLogin7Hari(),
    activityLogService.list({ limit: 6 }),
  ]);

  const maxTren = Math.max(1, ...tren.map((t) => t.warga + t.cms));
  const monitoringSiap = Boolean(UPTIME_KUMA_URL);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <span className="overline-doc text-brass">Ringkasan Sistem</span>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            Dashboard Pengawasan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-inkmut">
            Pemantauan metrik utama dari audit log. Status uptime & resource
            server dipantau Uptime Kuma.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-sm border border-line bg-paper2/40 px-3 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-pine-700" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-pine-800">
            SYSTEM_ONLINE
          </span>
        </div>
      </div>

      {/* Kartu statistik — data nyata dari audit log */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Log (24 jam)"
          value={ringkasan.totalLog.toLocaleString("id-ID")}
          sub="aktivitas tercatat"
        />
        <StatCard
          label="Login Gagal (24 jam)"
          value={String(ringkasan.loginGagal)}
          sub={ringkasan.loginGagal > 0 ? "perlu diperhatikan" : "aman"}
          tone={ringkasan.loginGagal > 0 ? "oxide" : "pine"}
        />
        <StatCard
          label="Uptime Server"
          value={monitoringSiap ? "—" : "n/a"}
          sub="via Uptime Kuma"
          tone="brass"
        />
        <StatCard
          label="Penggunaan Disk"
          value={monitoringSiap ? "—" : "n/a"}
          sub="via Coolify"
          tone="brass"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tren login 7 hari — data nyata dari audit log */}
        <section className="card-doc p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="label-doc">Tren Aktivitas Login (7 hari)</span>
            <div className="flex gap-4 text-[11px] text-inkmut">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 bg-brass" /> Warga
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 bg-pine-800" /> CMS
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-end gap-2" style={{ height: 160 }}>
            {tren.map((t) => {
              const total = t.warga + t.cms;
              const tinggi = (total / maxTren) * 140;
              return (
                <div
                  key={t.tanggal}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="flex w-full flex-col justify-end overflow-hidden rounded-sm"
                    style={{ height: 140 }}
                    title={`${total} login (${t.warga} warga, ${t.cms} CMS)`}
                  >
                    <div
                      className="w-full bg-brass"
                      style={{ height: total ? (t.warga / total) * tinggi : 0 }}
                    />
                    <div
                      className="w-full bg-pine-800"
                      style={{ height: total ? (t.cms / total) * tinggi : 0 }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-inkmut">
                    {t.tanggal.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Aktivitas terbaru — dari audit log */}
        <section className="card-doc flex flex-col p-5">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="label-doc">Aktivitas Terbaru</span>
            <Link
              href="/admin/monitoring/audit"
              className="text-[11px] text-brass hover:underline"
            >
              Semua log →
            </Link>
          </div>
          <ul className="mt-1 flex flex-col divide-y divide-line/60">
            {terbaru.items.length === 0 && (
              <li className="py-3 text-sm text-inkmut">
                Belum ada aktivitas tercatat.
              </li>
            )}
            {terbaru.items.map((log) => (
              <li key={log.id} className="py-2.5">
                <div className="text-sm text-ink">{log.summary}</div>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-[11px] text-inkmut">{log.actorName}</span>
                  <span className="font-mono text-[10px] text-inkmut">
                    {formatTanggalWaktu(log.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
