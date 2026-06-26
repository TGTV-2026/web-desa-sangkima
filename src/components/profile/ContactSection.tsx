// Seksi #kontak: form pesan resmi + blok info + peta interaktif Leaflet kantor desa.
// Alamat, surel, dan titik peta dari CMS (props); warna kategori marker tetap dari peta-data.
import Reveal from "./Reveal";
import Seal from "./Seal";
import ContactForm from "./ContactForm";
import ContactMap from "./ContactMap";
import { KATEGORI_WARNA } from "./peta-data";
import { Mail, MapPin, Move } from "./icons";
import type { KontakContent } from "@/server/types/content";

export default function ContactSection({
  content,
}: {
  content: KontakContent;
}) {
  const { alamat: ALAMAT, email: EMAIL } = content;
  return (
    <section id="kontak" className="relative bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-12">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Hubungi Kami
          </span>
          <h2 className="mb-6 font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pine-900 md:text-[48px] md:leading-[52px]">
            Temukan Kami di Jantung Sangkima
          </h2>
          <p className="text-sm leading-6 text-inkmut">
            Hubungi pemerintah desa untuk keperluan administratif, pelaporan,
            atau sekadar menyapa. Kami hadir untuk melayani warga Sangkima dengan
            dedikasi dan integritas.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          {/* Form + info kontak */}
          <Reveal className="h-full">
            <Seal className="h-full bg-card">
              <div className="p-8 md:p-10">
                <h3 className="mb-8 border-b border-line pb-4 font-serif text-[24px] text-pine-900">
                  Kirim Pesan Resmi
                </h3>
                <ContactForm />

                <div className="mt-10 space-y-4 border border-line bg-paper2/40 p-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-pine-800" />
                    <div>
                      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                        Kantor Desa Sangkima
                      </div>
                      <p className="text-sm leading-6 text-inkmut">{ALAMAT}</p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-line" />
                  <div className="flex items-start gap-4">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-pine-800" />
                    <div>
                      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                        Surel Resmi
                      </div>
                      <p className="font-mono text-sm text-inkmut">{EMAIL}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Seal>
          </Reveal>

          {/* Peta interaktif Leaflet + legend */}
          <Reveal className="h-full" delay={150}>
            <div className="flex h-full flex-col gap-4">
              <div className="relative min-h-[460px] flex-1 border border-inkmut/35 p-2">
                <span className="pointer-events-none absolute inset-1.5 z-10 border border-line" />

                <div className="relative h-full w-full overflow-hidden">
                  {/* Label peta (di atas peta) */}
                  <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 border border-line bg-paper/90 px-4 py-2 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-brass" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                      Peta Wisata &amp; Layanan Sangkima
                    </span>
                  </div>

                  <ContactMap titik={content.titik} center={content.petaCenter} />
                </div>
              </div>

              {/* Legend kategori */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border border-line bg-card px-4 py-3">
                {Object.entries(KATEGORI_WARNA).map(([kategori, warna]) => (
                  <span
                    key={kategori}
                    className="flex items-center gap-2 text-xs text-inkmut"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: warna }}
                    />
                    {kategori}
                  </span>
                ))}
                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-inkmut/70">
                  <Move className="h-3.5 w-3.5" />
                  Arahkan kursor ke titik untuk detail
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
