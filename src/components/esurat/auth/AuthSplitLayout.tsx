export interface AuthSplitLayoutProps {
  brandTitle: React.ReactNode;
  brandDescription: string;
  showMobileHeader?: boolean;
  scrollableForm?: boolean;
  children: React.ReactNode;
}

/** Shell dua-kolom institusional dipakai bersama Login, Register, dan VerifyOTP. */
export default function AuthSplitLayout({
  brandTitle,
  brandDescription,
  showMobileHeader = true,
  scrollableForm = false,
  children,
}: AuthSplitLayoutProps) {
  return (
    <main
      className={`${scrollableForm ? "h-dvh" : "min-h-screen"} w-screen grid lg:grid-cols-[1.1fr_1fr] bg-paper overflow-hidden`}
    >
      {/* ---------- Panel institusional (kiri) ---------- */}
      <section className="relative hidden lg:flex flex-col justify-between bg-pine-900 text-paper overflow-hidden px-14 py-12">
        <div className="absolute inset-4 border border-paper/15 rounded-sm pointer-events-none" />
        <span
          aria-hidden
          className="absolute -bottom-24 -right-6 font-serif italic text-[388px] leading-none text-paper/[0.045] select-none pointer-events-none"
        >
          S
        </span>

        <header className="relative rise-in">
          <p className="overline-doc !text-paper/50">
            Pemerintah Kabupaten Kutai Timur
          </p>
          <p className="text-[15px] font-semibold uppercase tracking-[0.18em] text-paper/50 mt-1">
            Kecamatan Sangatta Selatan
          </p>
        </header>

        <div className="relative rise-in" style={{ animationDelay: "120ms" }}>
          <div className="relative w-16 h-16 rounded-full border border-paper/40 grid place-items-center mb-8">
            <div className="absolute inset-[5px] rounded-full border border-paper/25" />
            <span className="font-serif font-semibold text-[24px] tracking-tight">
              DS
            </span>
          </div>

          <h1 className="font-serif text-[64px] font-medium tracking-tight leading-[1.05]">
            {brandTitle}
          </h1>
          <p className="mt-6 max-w-md text-[18px] leading-relaxed text-paper/65">
            {brandDescription}
          </p>
        </div>

        <footer
          className="relative rise-in text-[15px] tracking-[0.08em] uppercase text-paper/40"
          style={{ animationDelay: "240ms" }}
        >
          Jl. Poros Sangatta–Bontang · Desa Sangkima · Kalimantan Timur
        </footer>
      </section>

      {/* ---------- Panel form (kanan) ---------- */}
      <section
        className={`flex flex-col justify-center items-center px-4 md:px-12 lg:px-32 w-full h-full overflow-hidden bg-paper ${
          scrollableForm ? "py-4 h-full overflow-y-auto" : "py-6"
        }`}
      >
        {showMobileHeader && (
          <header className="lg:hidden mb-5 md:mb-10 w-full max-w-md rise-in">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full border border-ink/40 grid place-items-center shrink-0">
                <div className="absolute inset-[4px] rounded-full border border-ink/20" />
                <span className="font-serif font-semibold text-[18px]">DS</span>
              </div>
              <div>
                <p className="font-serif text-[22px] md:text-[24px] font-medium leading-tight">
                  E-Surat Desa Sangkima
                </p>
                <p className="text-[13px] md:text-[14px] uppercase tracking-[0.16em] text-inkmut">
                  Kab. Kutai Timur · Kec. Sangatta Selatan
                </p>
              </div>
            </div>
          </header>
        )}

        {/* Pembungkus form diizinkan melebar penuh (max-w-full) agar layout kanan padat tanpa whitespace sisa */}
        <div className="w-full max-w-full mx-auto flex flex-col justify-center">
          {children}
        </div>
      </section>
    </main>
  );
}
