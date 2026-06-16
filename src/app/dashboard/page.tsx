import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { LETTER_STATUSES } from "@/server/types/letter";
import { formatTanggal } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) redirect("/");

  const requests =
    session.role === "user"
      ? await letterRequestService.listForUser(session.id)
      : await letterRequestService.listAll();

  const counts = Object.fromEntries(
    LETTER_STATUSES.map((s) => [s, requests.filter((r) => r.status === s).length]),
  );
  const recent = requests.slice(0, 5);
  const isPetugas = session.role !== "user";

  const statCards = [
    { label: "Diajukan", value: counts.DIAJUKAN || 0, accent: "bg-ink/30" },
    { label: "Diproses", value: counts.DIPROSES || 0, accent: "bg-brass" },
    { label: "Disetujui", value: (counts.DISETUJUI || 0) + (counts.SELESAI || 0), accent: "bg-pine-600" },
    { label: "Ditolak", value: counts.DITOLAK || 0, accent: "bg-oxide" },
  ];

  return (
    /* CONTAINER UTAMA: Mengunci proporsi di laptop/PC agar tidak melar dan pas di mobile */
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 min-h-screen text-ink select-none antialiased">
      
      {/* ---------- KOP HALAMAN ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-line pb-6 sm:pb-8 mb-8 sm:mb-10 rise-in">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-inkmut">
            <span>Layanan Administrasi</span>
            <span className="text-line">/</span>
            <span className="text-brass">Beranda Warga</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mt-1.5 text-pine-900 truncate">
            Selamat datang, {session.name.split(" ")[0]}
          </h1>
          <p className="text-xs sm:text-sm text-inkmut mt-1 sm:mt-2 max-w-xl leading-relaxed">
            {isPetugas
              ? "Sistem kendali permohonan surat-menyurat resmi kependudukan warga Desa Sangkima."
              : "Ajukan surat resmi, pantau proses verifikasi, dan unduh dokumen bertanda tangan elektronik Anda."}
          </p>
        </div>
        
        {session.role === "user" && (
          <div className="w-full sm:w-auto shrink-0">
            <Link 
              href="/dashboard/ajukan" 
              className="btn-primary block w-full sm:inline-block sm:w-auto text-center shadow-sm hover:shadow transition-all text-xs sm:text-sm py-3 px-5"
            >
              Ajukan Surat Baru
            </Link>
          </div>
        )}
      </div>

      {/* ---------- GRID STATISTIK ---------- */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-8 sm:mb-10 rise-in"
        style={{ animationDelay: "80ms" }}
      >
        {statCards.map((c) => (
          <div 
            key={c.label} 
            className="card-doc p-4 sm:p-5 lg:p-6 bg-paper border border-line/60 rounded-sm shadow-sm hover:border-line transition-all group relative overflow-hidden"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.accent} opacity-70`} />
            <div className="flex justify-between items-baseline pl-1">
              <p className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tabular-nums tracking-tight text-ink group-hover:text-pine-900 transition-colors">
                {c.value}
              </p>
            </div>
            <p className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-inkmut mt-3 sm:mt-4 pl-1 truncate">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* ---------- TWO-COLUMN LAYOUT (SUDAH DISAMA RATAKAN TINGGINYA) ---------- */}
      {/* 🔑 KUNCI 1: Menambahkan `items-stretch` agar tinggi kolom kiri & kanan otomatis sama rata di layar besar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-8 items-stretch rise-in" style={{ animationDelay: "160ms" }}>
        
        {/* --- KOLOM KIRI: DAFTAR PENGAJUAN --- */}
        {/* 🔑 KUNCI 2: Ditambahkan `flex flex-col h-full` agar box ini mau memanjang mengikuti tinggi tetangganya */}
        <div className="card-doc bg-paper border border-line/70 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-paper2/20 border-b border-line gap-4 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1 sm:w-1.5 h-3 bg-pine-800 rounded-full shrink-0" />
              <h2 className="font-serif text-base sm:text-lg font-medium text-pine-900 truncate">
                {isPetugas ? "Daftar Permohonan Terbaru" : "Riwayat Pengajuan Terbaru"}
              </h2>
            </div>
            <Link
              href={isPetugas ? "/dashboard/permohonan" : "/dashboard/surat"}
              className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-brass hover:text-pine-900 hover:underline underline-offset-4 transition-colors shrink-0"
            >
              Lihat semua →
            </Link>
          </div>

          {recent.length === 0 ? (
            /* 🔑 KUNCI 3: Menggunakan `flex-1` agar area kosong ini otomatis menarik tinggi kontennya ke tengah secara simetris */
            <div className="px-4 sm:px-6 py-12 sm:py-16 text-center flex flex-col items-center justify-center flex-1 min-h-[280px]">
              <div className="w-11 h-11 rounded-full border border-line/80 grid place-items-center mb-3 text-inkmut/40 bg-paper2/20 text-xs font-serif italic">
                S
              </div>
              <h3 className="font-serif text-base font-medium text-ink">Belum Ada Catatan Pengajuan</h3>
              <p className="text-xs text-inkmut mt-1.5 max-w-xs leading-relaxed px-4">
                {isPetugas
                  ? "Seluruh permohonan surat dari warga Desa Sangkima akan tampil di dalam tabel kendali ini."
                  : "Anda belum memiliki riwayat pengajuan surat resmi. Mulai dengan mengklik tombol ajukan di atas."}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line/60 flex-1">
              {recent.map((r) => (
                <li key={r.id}>
                  <Link
                    href={isPetugas ? `/dashboard/permohonan/${r.id}` : `/dashboard/surat/${r.id}`}
                    className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 hover:bg-paper2/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs sm:text-sm text-ink hover:text-pine-900 transition-colors truncate">
                        {r.letterType.name}
                      </p>
                      <div className="text-[11px] sm:text-xs text-inkmut mt-1 flex items-center gap-2">
                        {isPetugas && <span className="font-medium text-ink truncate">{r.requester.name}</span>}
                        {isPetugas && <span className="text-line">·</span>}
                        <span>{formatTanggal(r.createdAt)}</span>
                      </div>
                    </div>
                    <div className="shrink-0 scale-90 sm:scale-100">
                      <StatusBadge status={r.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- KOLOM KANAN: PANEL PANDUAN ALUR --- */}
        {/* 🔑 KUNCI 4: Ditambahkan `flex flex-col h-full` juga agar seimbang */}
        <div className="card-doc bg-paper border border-line/70 rounded-sm shadow-sm p-5 sm:p-6 relative overflow-hidden flex flex-col h-full justify-between">
          <div>
            {/* Watermark dokumen */}
            <span className="absolute -bottom-10 -right-4 font-serif italic text-9xl text-ink/[0.025] pointer-events-none select-none">
              Sangkima
            </span>

            <div className="flex items-center gap-2 border-b border-line pb-3 mb-4">
              <span className="text-brass text-lg">✦</span>
              <h3 className="font-serif text-base sm:text-lg font-medium text-pine-900">Alur Layanan E-Surat</h3>
            </div>

            <ol className="relative border-l border-line/70 ml-2.5 space-y-5 text-xs text-inkmut">
              <li className="relative pl-5">
                <span className="absolute -left-[5px] top-1 flex h-2.5 w-2.5 rounded-full bg-brass" />
                <p className="font-semibold text-ink">1. Ajukan Secara Mandiri</p>
                <p className="mt-0.5 leading-relaxed">Pilih jenis surat yang Anda butuhkan, lalu isi formulir data tambahan sesuai instruksi dokumen.</p>
              </li>
              <li className="relative pl-5">
                <span className="absolute -left-[5px] top-1 flex h-2.5 w-2.5 rounded-full bg-inkmut/40" />
                <p className="font-semibold text-ink">2. Verifikasi Berkas</p>
                <p className="mt-0.5 leading-relaxed">Petugas administrasi kantor Desa Sangkima akan memeriksa kesesuaian identitas dan maksud tujuan Anda.</p>
              </li>
              <li className="relative pl-5">
                <span className="absolute -left-[5px] top-1 flex h-2.5 w-2.5 rounded-full bg-inkmut/40" />
                <p className="font-semibold text-ink">3. Unduh Dokumen Resmi</p>
                <p className="mt-0.5 leading-relaxed">Setelah disetujui Kepala Desa, surat digital berformat PDF lengkap dengan kode verifikasi resmi siap diunduh.</p>
              </li>
            </ol>
          </div>

          {/* Kotak lampu bantuan otomatis nempel presisi di paling bawah card */}
          <div className="mt-6 bg-paper2/40 border border-line/50 rounded-sm p-3.5 text-[11px] leading-relaxed text-inkmut shrink-0">
            💡 <span className="font-medium text-ink">Butuh Bantuan?</span> Jika proses verifikasi memakan waktu lebih dari 1x24 jam, Anda dapat mendatangi Kantor Desa Sangkima dengan membawa KTP asli.
          </div>
        </div>

      </div>
    </div>
  );
}