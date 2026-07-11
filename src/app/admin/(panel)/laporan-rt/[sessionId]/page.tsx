import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { rtReportService } from "@/server/services/rtReport.service";
import { formatTanggalWaktu } from "@/lib/format";

export const dynamic = "force-dynamic";

// Detail satu sesi untuk super_admin: rekap per dusun, daftar laporan masuk,
// dan RT yang belum setor.
export default async function DetailSesiPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireSuperAdmin();
  const { sessionId } = await params;

  let detail;
  try {
    detail = await rtReportService.getSessionDetail(sessionId);
  } catch {
    notFound();
  }
  const { session, reports, belumSetor } = detail;
  const rekap = await rtReportService.rekapPerDusun(sessionId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/laporan-rt"
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
          >
            ← Semua Sesi
          </Link>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            Laporan {session.bulanLabel} {session.tahun}
          </h1>
          <p className="mt-1 text-sm text-inkmut">
            {session.active ? "Sesi masih dibuka" : "Sesi sudah ditutup"} ·{" "}
            {reports.length} laporan masuk
          </p>
        </div>
      </div>

      {/* Rekap per dusun */}
      <section className="card-doc overflow-x-auto p-5">
        <span className="label-doc">Rekap per Dusun</span>
        <p className="mt-1 text-[11px] text-inkmut">
          Angka inilah yang dipakai memperbarui Statistik Dusun publik saat sesi
          ditutup. Dusun yang belum ada laporannya tidak diubah.
        </p>
        {rekap.length === 0 ? (
          <p className="mt-3 text-sm text-inkmut">Belum ada laporan masuk.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-inkmut">
                <th className="py-1 pr-3 font-semibold">Dusun</th>
                <th className="py-1 pr-3 font-semibold">KK</th>
                <th className="py-1 pr-3 font-semibold">Laki-laki</th>
                <th className="py-1 pr-3 font-semibold">Perempuan</th>
                <th className="py-1 pr-3 font-semibold">Total Jiwa</th>
                <th className="py-1 font-semibold">RT Setor</th>
              </tr>
            </thead>
            <tbody>
              {rekap.map((r) => (
                <tr key={r.dusun} className="border-t border-line/60">
                  <td className="py-1.5 pr-3 font-semibold text-ink">{r.dusun}</td>
                  <td className="py-1.5 pr-3">{r.kk}</td>
                  <td className="py-1.5 pr-3">{r.lakiLaki}</td>
                  <td className="py-1.5 pr-3">{r.perempuan}</td>
                  <td className="py-1.5 pr-3 font-semibold text-pine-900">
                    {r.lakiLaki + r.perempuan}
                  </td>
                  <td className="py-1.5">{r.jumlahRtSetor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* RT yang belum setor */}
      {belumSetor.length > 0 && (
        <section className="card-doc border-brass/40 bg-brass/5 p-5">
          <span className="label-doc">Belum Setor ({belumSetor.length} RT)</span>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {belumSetor.map((b) => (
              <li
                key={`${b.dusun}-${b.rt}`}
                className="rounded-sm border border-line bg-paper px-2 py-1"
              >
                RT {b.rt} {b.dusun} — {b.nama}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Daftar laporan masuk */}
      <section className="flex flex-col gap-2">
        <h2 className="font-serif text-lg text-pine-900">Laporan Masuk</h2>
        {reports.length === 0 && (
          <p className="card-doc p-5 text-sm text-inkmut">
            Belum ada ketua RT yang mengumpulkan laporan di sesi ini.
          </p>
        )}
        {reports.map((r) => (
          <div
            key={r.id}
            className="card-doc flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <div className="text-sm font-semibold text-ink">
                RT {r.rt} — {r.dusun}
              </div>
              <div className="text-[11px] text-inkmut">
                {r.namaKetua} · dikumpulkan {formatTanggalWaktu(r.dikumpulkanPada)}
                {r.diperbaruiPada.getTime() !== r.dikumpulkanPada.getTime() &&
                  ` · terakhir diedit ${formatTanggalWaktu(r.diperbaruiPada)}`}
              </div>
            </div>
            <Link
              href={`/admin/laporan-rt/${session.id}/${r.id}`}
              className="btn-outline text-xs"
            >
              Lihat Isi
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
