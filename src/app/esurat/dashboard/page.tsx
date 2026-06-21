import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import EmptyState from "@/components/esurat/EmptyState";
import StatCardsGrid, { type StatCardData } from "@/components/esurat/StatCardsGrid";
import LetterRequestListItem from "@/components/esurat/LetterRequestListItem";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { LETTER_STATUSES } from "@/server/types/letter";
import { formatTanggal } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  const requests =
    session.role === "user"
      ? await letterRequestService.listForUser(session.id)
      : await letterRequestService.listAll();

  const counts = Object.fromEntries(
    LETTER_STATUSES.map((s) => [s, requests.filter((r) => r.status === s).length]),
  );
  const recent = requests.slice(0, 5);
  const isPetugas = session.role !== "user";

  const statCards: StatCardData[] = [
    { label: "Diajukan", value: counts.DIAJUKAN || 0, accent: "ink" },
    { label: "Diproses", value: counts.DIPROSES || 0, accent: "brass" },
    { label: "Disetujui", value: (counts.DISETUJUI || 0) + (counts.SELESAI || 0), accent: "pine" },
    { label: "Ditolak", value: counts.DITOLAK || 0, accent: "oxide" },
  ];

  return (
    <div className="w-full text-ink select-none antialiased flex flex-col gap-4 md:gap-5">
      <PageHeader
        breadcrumb={{ parent: "Layanan Administrasi", current: "Beranda Warga" }}
        title={`Selamat datang, ${session.name.split(" ")[0]}`}
        description={
          isPetugas
            ? "Sistem kendali permohonan surat-menyurat resmi kependudukan warga Desa Sangkima."
            : "Ajukan surat resmi, pantau proses verifikasi, dan unduh dokumen bertanda tangan elektronik Anda."
        }
        /* 1. Diperbesar dari text-xs md:text-sm menjadi text-sm md:text-base */
        descriptionClassName="max-w-full text-sm md:text-base"
        bordered
        action={
          session.role === "user" ? (
            <Link
              href="/esurat/dashboard/ajukan"
              /* 2. Diperbesar dari text-xs md:text-sm menjadi text-sm md:text-base */
              className="btn-primary block w-full sm:inline-block sm:w-auto text-center shadow-sm hover:shadow transition-all text-sm md:text-base py-2 md:py-2.5 px-4 md:px-5"
            >
              Ajukan Surat Baru
            </Link>
          ) : undefined
        }
      />

      {session.role === "user" && !session.isProfileComplete && (
        <div className="rise-in bg-brass/5 border border-brass/30 rounded-sm px-4 py-2.5 flex items-start gap-3">
          <span className="text-brass text-base md:text-lg leading-none mt-0.5 shrink-0">⚠</span>
          <div className="min-w-0 flex-1">
            {/* 3. Diperbesar dari text-xs md:text-sm menjadi text-sm md:text-base */}
            <p className="text-sm md:text-base font-semibold text-pine-900">
              Data Profil Belum Lengkap
            </p>
            {/* 4. Diperbesar dari text-[11px] md:text-xs menjadi text-xs md:text-sm */}
            <p className="text-xs md:text-sm text-inkmut mt-0.5 leading-relaxed">
              Lengkapi data kependudukan Anda agar dapat mengajukan surat resmi.{" "}
              <Link
                href="/esurat/dashboard/profil"
                className="font-semibold text-brass hover:text-pine-900 underline underline-offset-2 transition-colors"
              >
                Lengkapi sekarang →
              </Link>
            </p>
          </div>
        </div>
      )}

      <StatCardsGrid cards={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 md:gap-5 items-stretch rise-in" style={{ animationDelay: "160ms" }}>

        {/* --- KOLOM KIRI --- */}
        <div className="card-doc bg-paper border border-line/70 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-2.5 bg-paper2/20 border-b border-line gap-4 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 md:w-1.5 h-3 bg-pine-800 rounded-full shrink-0" />
              {/* 5. Diperbesar dari text-sm md:text-base menjadi text-base md:text-lg */}
              <h2 className="font-serif text-base md:text-lg font-medium text-pine-900 truncate">
                {isPetugas ? "Daftar Permohonan Terbaru" : "Riwayat Pengajuan Terbaru"}
              </h2>
            </div>
            <Link
              href={isPetugas ? "/esurat/dashboard/permohonan" : "/esurat/dashboard/surat"}
              /* 6. Diperbesar dari text-[10px] md:text-xs menjadi text-xs md:text-sm */
              className="text-xs md:text-sm font-bold tracking-wide uppercase text-brass hover:text-pine-900 hover:underline underline-offset-4 transition-colors shrink-0"
            >
              Lihat semua →
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              icon
              title="Belum Ada Catatan Pengajuan"
              description={
                isPetugas
                  ? "Seluruh permohonan surat dari warga Desa Sangkima akan tampil di dalam tabel kendali ini."
                  : "Anda belum memiliki riwayat pengajuan surat resmi. Mulai dengan mengklik tombol ajukan di atas."
              }
            />
          ) : (
            <ul className="divide-y divide-line/60 flex-1">
              {recent.map((r) => (
                <LetterRequestListItem
                  key={r.id}
                  compact
                  href={isPetugas ? `/esurat/dashboard/permohonan/${r.id}` : `/esurat/dashboard/surat/${r.id}`}
                  title={r.letterType.name}
                  status={r.status}
                  subtitle={
                    /* 7. Diperbesar dari text-[11px] md:text-xs menjadi text-xs md:text-sm */
                    <div className="text-xs md:text-sm text-inkmut mt-0.5 flex items-center gap-2">
                      {isPetugas && <span className="font-medium text-ink truncate">{r.requester.name}</span>}
                      {isPetugas && <span className="text-line">·</span>}
                      <span>{formatTanggal(r.createdAt)}</span>
                    </div>
                  }
                />
              ))}
            </ul>
          )}
        </div>

        {/* --- KOLOM KANAN --- */}
        <div className="card-doc bg-paper border border-line/70 rounded-sm shadow-sm p-4 relative overflow-hidden flex flex-col h-full justify-between">
          <div>
            <span className="absolute -bottom-10 -right-4 font-serif italic text-6xl md:text-7xl lg:text-8xl text-ink/[0.025] pointer-events-none select-none">
              Sangkima
            </span>

            <div className="flex items-center gap-2 border-b border-line pb-2 mb-3">
              <span className="text-brass text-md md:text-lg">✦</span>
              {/* 8. Diperbesar dari text-sm md:text-base menjadi text-base md:text-lg */}
              <h3 className="font-serif text-base md:text-lg font-medium text-pine-900">Alur Layanan E-Surat</h3>
            </div>

            {/* 9. Diperbesar dari text-[11px] md:text-xs menjadi text-xs md:text-sm */}
            <ol className="relative border-l border-line/70 ml-2 space-y-3.5 text-xs md:text-sm text-inkmut">
              <li className="relative pl-4">
                <span className="absolute -left-[4.5px] top-1 flex h-2 w-2 rounded-full bg-brass" />
                <p className="font-semibold text-ink">1. Ajukan Secara Mandiri</p>
                <p className="mt-0.5 leading-relaxed">Pilih jenis surat yang Anda butuhkan, lalu isi formulir data tambahan sesuai instruksi dokumen.</p>
              </li>
              <li className="relative pl-4">
                <span className="absolute -left-[4.5px] top-1 flex h-2 w-2 rounded-full bg-inkmut/40" />
                <p className="font-semibold text-ink">2. Verifikasi Berkas</p>
                <p className="mt-0.5 leading-relaxed">Petugas administrasi kantor Desa Sangkima akan memeriksa kesesuaian identitas dan maksud tujuan Anda.</p>
              </li>
              <li className="relative pl-4">
                <span className="absolute -left-[4.5px] top-1 flex h-2 w-2 rounded-full bg-inkmut/40" />
                <p className="font-semibold text-ink">3. Unduh Dokumen Resmi</p>
                <p className="mt-0.5 leading-relaxed">Setelah disetujui Kepala Desa, surat digital berformat PDF lengkap dengan kode verifikasi resmi siap diunduh.</p>
              </li>
            </ol>
          </div>

          {/* 10. Diperbesar dari text-[10px] md:text-[11px] menjadi text-xs md:text-sm */}
          <div className="mt-4 bg-paper2/40 border border-line/50 rounded-sm p-3 text-xs md:text-sm leading-relaxed text-inkmut shrink-0 relative z-10">
            💡 <span className="font-medium text-ink">Butuh Bantuan?</span> Jika proses verifikasi memakan waktu lebih dari 1x24 jam, Anda dapat mendatangi Kantor Desa Sangkima dengan membawa KTP asli.
          </div>
        </div>

      </div>
    </div>
  );
}