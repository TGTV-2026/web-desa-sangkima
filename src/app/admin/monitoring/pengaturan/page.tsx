import { requireMonitoringUser } from "@/server/utils/cmsSession";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { activityLogService } from "@/server/services/activityLog.service";
import { formatTanggalWaktu } from "@/lib/format";
import AccountList from "./AccountList";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const me = await requireMonitoringUser();

  const [akun, akunLogs] = await Promise.all([
    cmsUserService.listAll(),
    activityLogService.list({ category: "akun", limit: 50 }),
  ]);

  // Riwayat "Bulk Create RT" (impor CSV) diambil langsung dari audit log —
  // tak perlu tabel khusus.
  const csvLogs = akunLogs.items.filter(
    (l) => l.action === "cms_user.bulk_create_rt",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-line pb-4">
        <span className="overline-doc text-brass">Manajemen Otorisasi</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Kelola Akun
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-inkmut">
          Daftar kredensial sistem & riwayat integrasi data massal. Pengawas
          dapat menangguhkan/memulihkan akun; pembuatan &amp; penyuntingan akun
          dilakukan super admin di CMS. Semua perubahan tercatat di audit log.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Daftar kredensial aktif (span 2) */}
        <div className="xl:col-span-2">
          <AccountList items={akun} currentUserId={me.id} />
        </div>

        {/* Log integrasi CSV (span 1) */}
        <section className="card-doc flex flex-col p-5">
          <div className="border-b border-line pb-3">
            <span className="label-doc">Log Integrasi CSV</span>
            <p className="mt-1 text-[11px] text-inkmut">
              Riwayat &ldquo;Bulk Create RT&rdquo;
            </p>
          </div>
          <ul className="mt-1 flex flex-col divide-y divide-line/60">
            {csvLogs.length === 0 && (
              <li className="py-3 text-sm text-inkmut">
                Belum ada impor CSV tercatat.
              </li>
            )}
            {csvLogs.map((log) => (
              <li key={log.id} className="py-3">
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
