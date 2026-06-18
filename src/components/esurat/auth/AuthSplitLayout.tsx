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
      className={`${scrollableForm ? "h-screen" : "min-h-screen"} grid lg:grid-cols-[1.1fr_1fr]`}
    >
      {/* ---------- Panel institusional (kiri) ---------- */}
      <section className="relative hidden lg:flex flex-col justify-between bg-pine-900 text-paper overflow-hidden px-14 py-12">
        <div className="absolute inset-4 border border-paper/15 rounded-sm pointer-events-none" />
        <span
          aria-hidden
          className="absolute -bottom-24 -right-6 font-serif italic text-[24rem] leading-none text-paper/[0.045] select-none pointer-events-none"
        >
          S
        </span>

        <header className="relative rise-in">
          <p className="overline-doc !text-paper/50">
            Pemerintah Kabupaten Kutai Timur
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/50 mt-1">
            Kecamatan Sangatta Selatan
          </p>
        </header>

        <div className="relative rise-in" style={{ animationDelay: "120ms" }}>
          <div className="relative w-16 h-16 rounded-full border border-paper/40 grid place-items-center mb-8">
            <div className="absolute inset-[5px] rounded-full border border-paper/25" />
            <span className="font-serif font-semibold text-xl tracking-tight">
              DS
            </span>
          </div>

          <h1 className="font-serif text-6xl font-medium tracking-tight leading-[1.05]">
            {brandTitle}
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/65">
            {brandDescription}
          </p>
        </div>

        <footer
          className="relative rise-in text-[11px] tracking-[0.08em] uppercase text-paper/40"
          style={{ animationDelay: "240ms" }}
        >
          Jl. Poros Sangatta–Bontang · Desa Sangkima · Kalimantan Timur
        </footer>
      </section>

      {/* ---------- Panel form (kanan) ---------- */}
      <section
        className={`flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 bg-paper ${
          scrollableForm ? "py-6 h-full overflow-y-auto" : "py-12"
        }`}
      >
        {showMobileHeader && (
          <header className="lg:hidden mb-10 rise-in">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-full border border-ink/40 grid place-items-center shrink-0">
                <div className="absolute inset-[4px] rounded-full border border-ink/20" />
                <span className="font-serif font-semibold text-sm">DS</span>
              </div>
              <div>
                <p className="font-serif text-xl font-medium leading-tight">
                  E-Surat Desa Sangkima
                </p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-inkmut">
                  Kab. Kutai Timur · Kec. Sangatta Selatan
                </p>
              </div>
            </div>
          </header>
        )}

        <div className="w-full max-w-sm mx-auto lg:mx-0">{children}</div>
      </section>
    </main>
  );
}
