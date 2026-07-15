import { requireMonitoringUser } from "@/server/utils/cmsSession";

export const dynamic = "force-dynamic";

// Endpoint yang dipantau (path-based, sesuai realita: satu app, bukan subdomain).
const ENDPOINTS = [
  { label: "Beranda Desa", path: "/", url: "https://desasangkima.cloud/" },
  { label: "Layanan E-Surat", path: "/esurat", url: "https://desasangkima.cloud/esurat" },
  { label: "CMS Admin", path: "/admin", url: "https://desasangkima.cloud/admin" },
];

// URL dashboard Uptime Kuma & Coolify — diisi lewat env saat monitoring
// dikonfigurasi. Selama kosong, panel menampilkan ajakan menghubungkan.
const UPTIME_KUMA_URL = process.env.UPTIME_KUMA_URL ?? "";
const COOLIFY_URL = process.env.COOLIFY_DASHBOARD_URL ?? "";

export default async function InfrastrukturPage() {
  await requireMonitoringUser();
  const monitoringSiap = Boolean(UPTIME_KUMA_URL);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-line pb-4">
        <span className="overline-doc text-brass">Infrastruktur &amp; Uptime</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Status Server
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-inkmut">
          Ketersediaan endpoint publik & resource server. Dipantau oleh Uptime
          Kuma; notifikasi diarahkan ke Telegram.
        </p>
      </div>

      <section className="card-doc p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
          <span className="label-doc">Endpoint Dipantau</span>
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
            {COOLIFY_URL ? "" : " & COOLIFY_DASHBOARD_URL"} agar tautan &amp; metrik
            uptime/resource muncul di sini. Notifikasi arahkan ke Telegram (bukan
            email), sesuai PRD.
          </p>
        )}
      </section>
    </div>
  );
}
