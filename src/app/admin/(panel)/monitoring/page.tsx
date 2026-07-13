import Link from "next/link";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { activityLogService } from "@/server/services/activityLog.service";
import { formatTanggalWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

// Endpoint yang dipantau (path-based, sesuai realita: satu app, bukan subdomain).
const ENDPOINTS = [
  { label: "Beranda Desa", path: "/", url: "https://desasangkima.cloud/" },
  { label: "Layanan E-Surat", path: "/esurat", url: "https://desasangkima.cloud/esurat" },
  { label: "CMS Admin", path: "/admin", url: "https://desasangkima.cloud/admin" },
];

// URL dashboard Uptime Kuma & Coolify — diisi lewat env saat monitoring
// dikonfigurasi. Selama kosong, panel infrastruktur menampilkan ajakan hubungkan.
const UPTIME_KUMA_URL = process.env.UPTIME_KUMA_URL ?? "";
const COOLIFY_URL = process.env.COOLIFY_DASHBOARD_URL ?? "";

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

export default async function MonitoringPage() {
  await requireSuperAdmin();

  const [ringkasan, tren, terbaru] = await Promise.all([
    activityLogService.ringkasan24Jam(),
    activityLogService.trenLogin7Hari(),
    activityLogService.list({ limit: 6 }),
  ]);

  const maxTren = Math.max(1, ...tren.map((t) => t.warga + t.cms));
  const monitoringSiap = Boolean(UPTIME_KUMA_URL);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Kesehatan Sistem</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Monitoring Sistem
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-inkmut">
          Ringkasan aktivitas & performa. Angka aktivitas diambil langsung dari
          audit log; status uptime & resource server dipantau oleh Uptime Kuma.
        </p>
      </div>

      {/* Kartu statistik — dari data audit yang nyata */}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tren login 7 hari — data nyata dari audit log */}
        <section className="card-doc p-5">
          <span className="label-doc">Tren Aktivitas Login (7 hari)</span>
          <div className="mt-4 flex items-end gap-2" style={{ height: 140 }}>
            {tren.map((t) => {
              const total = t.warga + t.cms;
              const tinggi = (total / maxTren) * 120;
              return (
                <div key={t.tanggal} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="flex w-full flex-col justify-end overflow-hidden rounded-sm"
                    style={{ height: 120 }}
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
                  <span className="text-[9px] text-inkmut">{t.tanggal.slice(5)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex gap-4 text-[11px] text-inkmut">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 bg-brass" /> Warga
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 bg-pine-800" /> CMS
            </span>
          </div>
        </section>

        {/* Aktivitas terbaru — dari audit log */}
        <section className="card-doc p-5">
          <div className="flex items-center justify-between">
            <span className="label-doc">Aktivitas Terbaru</span>
            <Link href="/admin/audit" className="text-[11px] text-brass hover:underline">
              Lihat semua log →
            </Link>
          </div>
          <ul className="mt-3 flex flex-col divide-y divide-line/60">
            {terbaru.items.length === 0 && (
              <li className="py-3 text-sm text-inkmut">Belum ada aktivitas tercatat.</li>
            )}
            {terbaru.items.map((log) => (
              <li key={log.id} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <div className="text-sm text-ink">{log.summary}</div>
                  <div className="text-[11px] text-inkmut">{log.actorName}</div>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-inkmut">
                  {formatTanggalWaktu(log.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Infrastruktur & Uptime */}
      <section className="card-doc p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="label-doc">Status Infrastruktur &amp; Uptime</span>
          {monitoringSiap ? (
            <a
              href={UPTIME_KUMA_URL}
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-xs"
            >
              Buka Uptime Kuma ↗
            </a>
          ) : (
            <span className="rounded-sm bg-brass/10 px-2 py-1 text-[11px] text-brass">
              Uptime Kuma belum terhubung
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="rounded-sm border border-line bg-paper2/30 p-3">
              <div className="text-sm font-semibold text-ink">{e.label}</div>
              <a
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-inkmut hover:text-pine-900"
              >
                desasangkima.cloud{e.path === "/" ? "" : e.path}
              </a>
              <div className="mt-1 text-[11px] text-inkmut">
                {monitoringSiap ? "dipantau Uptime Kuma" : "status: belum dipantau"}
              </div>
            </div>
          ))}
        </div>

        {!monitoringSiap && (
          <p className="mt-4 rounded-sm border border-line bg-paper2/40 p-3 text-[12px] leading-5 text-inkmut">
            <span className="font-semibold text-ink">Menghubungkan monitoring:</span>{" "}
            deploy <span className="font-mono">Uptime Kuma</span> dari Coolify,
            tambahkan monitor untuk ketiga endpoint di atas + sertifikat SSL, lalu
            isi env <span className="font-mono">UPTIME_KUMA_URL</span>
            {COOLIFY_URL ? "" : " & COOLIFY_DASHBOARD_URL"} agar tautan &amp;
            metrik uptime/resource muncul di sini. Notifikasi arahkan ke Telegram
            (bukan email), sesuai PRD.
          </p>
        )}
      </section>
    </div>
  );
}
