import { letterRequestService } from "@/server/services/letterRequest.service";

type PageProps = { params: Promise<{ code: string }> };

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatTanggal(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

// Halaman publik (tanpa login) untuk verifikasi keaslian surat via QR —
// digayakan seperti sertifikat/arsip resmi desa.
export default async function VerifikasiPage({ params }: PageProps) {
  const { code } = await params;
  const result = await letterRequestService.verifyByCode(code);

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-md card-doc p-2 rise-in">
        {/* bingkai ganda ala dokumen resmi */}
        <div className="border border-line rounded-[4px] px-7 py-9">
          {/* kop */}
          <header className="text-center pb-6 border-b border-line">
            <div className="relative w-12 h-12 mx-auto rounded-full border border-ink/40 grid place-items-center">
              <div className="absolute inset-[4px] rounded-full border border-ink/20" />
              <span className="font-serif font-semibold text-sm">DS</span>
            </div>
            <p className="overline-doc mt-4">Pemerintah Desa Sangkima</p>
            <h1 className="font-serif text-2xl font-medium tracking-tight mt-1">
              Verifikasi Keaslian Surat
            </h1>
          </header>

          {result.valid ? (
            <div>
              {/* stempel sah */}
              <div className="flex justify-center my-8">
                <span className="inline-block border-2 border-pine-700 text-pine-700 rounded-[4px] px-5 py-2 font-bold uppercase tracking-[0.2em] text-sm -rotate-3 select-none">
                  Asli &amp; Sah
                </span>
              </div>

              <dl className="text-sm">
                <div className="flex justify-between gap-4 py-2.5 border-b border-dotted border-line">
                  <dt className="text-inkmut">Nomor Surat</dt>
                  <dd className="font-mono text-[13px] text-brass text-right">
                    {result.letterNumber}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-2.5 border-b border-dotted border-line">
                  <dt className="text-inkmut">Jenis Surat</dt>
                  <dd className="font-medium text-right">{result.letterTypeName}</dd>
                </div>
                <div className="flex justify-between gap-4 py-2.5 border-b border-dotted border-line">
                  <dt className="text-inkmut">Atas Nama</dt>
                  <dd className="font-medium text-right">{result.requesterName}</dd>
                </div>
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="text-inkmut">Tanggal Terbit</dt>
                  <dd className="font-medium text-right">
                    {formatTanggal(result.approvedAt)}
                  </dd>
                </div>
              </dl>

              <p className="text-[11px] text-inkmut text-center mt-6 leading-relaxed">
                Dokumen ini diterbitkan secara elektronik oleh Pemerintah Desa
                Sangkima dan terdaftar dalam arsip desa.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center my-8">
                <span className="inline-block border-2 border-oxide text-oxide rounded-[4px] px-5 py-2 font-bold uppercase tracking-[0.2em] text-sm -rotate-3 select-none">
                  Tidak Valid
                </span>
              </div>
              <p className="font-serif text-lg">Surat tidak ditemukan</p>
              <p className="text-sm text-inkmut mt-2 leading-relaxed">
                Kode verifikasi tidak terdaftar dalam arsip desa, atau surat
                tidak sah. Hubungi kantor desa bila Anda yakin ini keliru.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
