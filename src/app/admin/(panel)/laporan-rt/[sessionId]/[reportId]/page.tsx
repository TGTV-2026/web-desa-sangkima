import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { rtReportService } from "@/server/services/rtReport.service";
import LaporanForm from "../../LaporanForm";

export const dynamic = "force-dynamic";

// Super_admin membaca isi satu laporan — memakai form yang sama dengan yang
// diisi RT, tapi read-only, supaya tampilannya identik dan tak ada dua
// renderer yang harus dirawat.
export default async function DetailLaporanPage({
  params,
}: {
  params: Promise<{ sessionId: string; reportId: string }>;
}) {
  await requireSuperAdmin();
  const { sessionId, reportId } = await params;

  let detail;
  try {
    detail = await rtReportService.getSessionDetail(sessionId);
  } catch {
    notFound();
  }
  const report = detail.reports.find((r) => r.id === reportId);
  if (!report) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/laporan-rt/${sessionId}`}
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Laporan {detail.session.bulanLabel} {detail.session.tahun}
        </Link>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Laporan RT {report.rt} — {report.dusun}
        </h1>
      </div>

      <LaporanForm
        session={detail.session}
        report={report}
        namaKetua={report.namaKetua}
        dusun={report.dusun}
        rt={report.rt}
        readOnly
      />
    </div>
  );
}
