export const dynamic = "force-dynamic";

// Halaman Infrastruktur — ringkasan konfigurasi monitoring uptime (PRD §11).
// Status live ada di UptimeRobot (pengecek eksternal, di luar VPS); halaman ini
// mendokumentasikan apa yang dipantau + kanal alert, bukan menarik status live
// (integrasi API UptimeRobot opsional untuk nanti).

const MONITORS = [
  { name: "Beranda publik", target: "desasangkima.cloud/", cek: "HTTP 200" },
  { name: "E-Surat", target: "desasangkima.cloud/esurat", cek: "Layanan surat hidup" },
  { name: "CMS", target: "desasangkima.cloud/admin/login", cek: "CMS hidup" },
  { name: "Sertifikat SSL", target: "desasangkima.cloud", cek: "Alarm < 14 hari" },
  { name: "Port MySQL (opsional)", target: "internal TCP", cek: "Container DB hidup" },
];

const AMBANG = [
  "Down > 1 menit → kirim alert",
  "Disk usage > 85% (Coolify) → kirim alert",
  "Container unhealthy → kirim alert",
];

function Dot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#10b981]" />
    </span>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#24323d] bg-[#161f26] p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#8b98a5]">
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function MonitoringInfraPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#e0e2ea]">Infrastructure</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#8b98a5]">
          Pemantauan uptime & resource. Pengecekan dilakukan oleh{" "}
          <span className="text-[#e0e2ea]">UptimeRobot</span> (eksternal, di luar
          VPS) + Coolify bawaan. Status live ada di dashboard UptimeRobot.
        </p>
      </div>

      <Card title="Endpoint yang Dipantau">
        <div className="overflow-hidden rounded-md border border-[#24323d]">
          {MONITORS.map((m, i) => (
            <div
              key={m.name}
              className={`flex items-center gap-4 px-4 py-3 ${
                i > 0 ? "border-t border-[#24323d]" : ""
              }`}
            >
              <Dot />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[#e0e2ea]">{m.name}</div>
                <div className="truncate font-mono text-[11px] text-[#6b7b88]">
                  {m.target}
                </div>
              </div>
              <div className="shrink-0 text-xs text-[#8b98a5]">{m.cek}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-[#6b7b88]">
          Indikator hijau = monitor terkonfigurasi. Untuk status naik/turun
          sesungguhnya, buka dashboard UptimeRobot.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Ambang Alert">
          <ul className="flex flex-col gap-2 text-sm text-[#c7d0d9]">
            {AMBANG.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <span className="mt-1 text-[#10b981]">•</span>
                {a}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Kanal Notifikasi">
          <p className="text-sm text-[#c7d0d9]">
            <span className="font-semibold text-[#e0e2ea]">Telegram</span> — jalan
            di luar VPS ini, jadi alert tetap sampai walau server/VPS down. Coolify
            bawaan (disk, container, backup) dikirim ke kanal yang sama.
          </p>
          <p className="mt-3 text-[11px] text-[#6b7b88]">
            Bukan email: bila VPS/email yang down, alert lewat email tak sampai.
          </p>
        </Card>
      </div>

      <p className="text-xs text-[#6b7b88]">
        Detail konfigurasi lengkap ada di{" "}
        <span className="font-mono text-[#8b98a5]">docs/MONITORING.md</span>.
      </p>
    </div>
  );
}
