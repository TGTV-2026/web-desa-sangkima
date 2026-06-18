import Link from "next/link";

interface ProfileIncompleteBlockerProps {
  missingFields: string[];
}

/** Ditampilkan sebagai pengganti form ajukan surat jika profil warga belum lengkap. */
export default function ProfileIncompleteBlocker({
  missingFields,
}: ProfileIncompleteBlockerProps) {
  return (
    <div className="card-doc p-6 sm:p-8 md:p-10 bg-paper border border-line/70 rounded-sm shadow-sm text-center rise-in">
      {/* Ikon peringatan */}
      <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-brass/10 border border-brass/30 grid place-items-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-8 h-8 text-brass"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h2 className="font-serif text-xl sm:text-2xl font-medium text-pine-900 mb-2">
        Data Profil Belum Lengkap
      </h2>
      <p className="text-sm text-inkmut max-w-md mx-auto leading-relaxed mb-6">
        Untuk mengajukan surat resmi, seluruh data kependudukan Anda harus
        terisi lengkap terlebih dahulu. Silakan lengkapi profil Anda sebelum
        melanjutkan.
      </p>

      {/* Daftar field yang masih kosong */}
      {missingFields.length > 0 && (
        <div className="bg-paper2/40 border border-line/50 rounded-sm p-4 mb-6 max-w-sm mx-auto text-left">
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-inkmut mb-2">
            Data yang belum diisi:
          </p>
          <ul className="space-y-1">
            {missingFields.map((field) => (
              <li
                key={field}
                className="flex items-center gap-2 text-xs text-ink"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-oxide shrink-0" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/esurat/dashboard/profil"
        className="btn-primary inline-block shadow-sm py-3 px-6 font-bold tracking-wide uppercase text-xs transition-all"
      >
        Lengkapi Profil Sekarang
      </Link>
    </div>
  );
}
