import { redirect } from "next/navigation";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { rtReportService } from "@/server/services/rtReport.service";
import { rtReportRepository } from "@/server/repositories/rtReport.repository";
import { formatTanggalWaktu } from "@/lib/format";
import LaporanForm from "./LaporanForm";
import SesiPanel from "./SesiPanel";

export const dynamic = "force-dynamic";

// Satu route, dua wajah: ketua RT melihat form laporannya sendiri;
// super_admin melihat panel kelola sesi. Editor tidak punya urusan di sini.
export default async function LaporanRtPage() {
  const user = await requireCmsUser();

  if (user.role === "editor") redirect("/admin");

  // ===== Super admin: kelola sesi =====
  if (user.role === "super_admin") {
    const [sessions, akunRt] = await Promise.all([
      rtReportService.listSessions(),
      rtReportRepository.findAllRtAccounts(),
    ]);
    return (
      <div className="flex flex-col gap-6">
        <div>
          <span className="overline-doc text-brass">Laporan RT</span>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            Sesi Pelaporan
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
            Buka sesi agar ketua RT bisa mengisi laporan kependudukan &amp;
            potensi desa. Saat sesi ditutup, rekapnya otomatis memperbarui
            Statistik Dusun di website publik.
          </p>
        </div>
        <SesiPanel sessions={sessions} jumlahAkunRt={akunRt.length} />
      </div>
    );
  }

  // ===== Ketua RT: form laporan di sesi aktif =====
  const [{ session, report }, riwayat] = await Promise.all([
    rtReportService.getMyReport(user),
    rtReportService.getMyHistory(user),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Laporan RT</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Laporan Kependudukan &amp; Potensi
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Isi laporan seperti biasa Anda mengisi berkas Excel bulanan. Boleh
          disimpan berkala — angka bisa diubah kapan pun selama sesi masih
          dibuka admin desa.
        </p>
      </div>

      {session ? (
        <LaporanForm
          session={session}
          report={report}
          namaKetua={user.name}
          dusun={user.dusun ?? "-"}
          rt={user.rt ?? "-"}
        />
      ) : (
        <div className="card-doc p-6 text-sm text-inkmut">
          Belum ada sesi pelaporan yang dibuka. Tunggu pemberitahuan dari admin
          desa, lalu buka halaman ini lagi.
        </div>
      )}

      {riwayat.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-serif text-lg text-pine-900">Riwayat Setoran</h2>
          {riwayat.map((r) => (
            <div
              key={r.periode}
              className="card-doc flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="font-semibold text-ink">{r.periode}</span>
              <span className="text-[11px] text-inkmut">
                Dikumpulkan {formatTanggalWaktu(r.dikumpulkanPada)} · terakhir
                diedit {formatTanggalWaktu(r.diperbaruiPada)}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
