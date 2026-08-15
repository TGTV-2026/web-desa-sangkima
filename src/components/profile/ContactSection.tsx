// Seksi #kontak: peta interaktif Leaflet FULL-WIDTH + kontak WhatsApp & Instagram.
// Data (alamat, titik peta, link WA/IG) dari CMS; warna kategori marker dari peta-data.
import Reveal from "./Reveal";
import ContactMap from "./ContactMap";
import { KATEGORI_WARNA, WARNA_DEFAULT } from "./peta-data";
import { MapPin, Move, WhatsApp, Instagram, Facebook, TikTok } from "./icons";
import type { KontakContent } from "@/server/types/content";

export default function ContactSection({
  content,
}: {
  content: KontakContent;
}) {
  // Legend hanya menampilkan kategori yang benar-benar dipakai titik (bukan
  // seluruh KATEGORI_WARNA) agar tak muncul kategori kosong.
  const kategoriDipakai = Array.from(
    new Set(content.titik.map((t) => t.kategori)),
  );

  return (
    <section id="kontak" className="relative bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-12">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Hubungi Kami
          </span>
          <h2 className="mb-6 font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pine-900 md:text-[48px] md:leading-[52px]">
            Peta Interaktif Sangkima
          </h2>
          <p className="text-sm leading-6 text-inkmut">
            Hubungi pemerintah desa untuk keperluan administratif, pelaporan,
            atau sekadar menyapa. Kami hadir untuk melayani warga Sangkima dengan
            dedikasi dan integritas.
          </p>
        </Reveal>

        {/* Peta interaktif — full width */}
        <Reveal>
          <div className="relative border border-inkmut/35 p-2">
            <span className="pointer-events-none absolute inset-1.5 z-10 border border-line" />
            <div className="relative h-[440px] w-full overflow-hidden md:h-[600px]">
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
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border border-line bg-card px-4 py-3">
            {kategoriDipakai.map((kategori) => (
              <span
                key={kategori}
                className="flex items-center gap-2 text-xs text-inkmut"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: KATEGORI_WARNA[kategori] ?? WARNA_DEFAULT }}
                />
                {kategori}
              </span>
            ))}
            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-inkmut/70">
              <Move className="h-3.5 w-3.5" />
              Arahkan kursor ke titik untuk detail
            </span>
          </div>
        </Reveal>

        {/* Kontak: WhatsApp & Instagram + alamat kantor */}
        <Reveal className="mt-8" delay={120}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.whatsapp && (
              <a
                href={content.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-700 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-900/5 text-pine-800 transition-colors group-hover:bg-pine-900 group-hover:text-paper">
                  <WhatsApp className="h-6 w-6" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                    WhatsApp
                  </span>
                  <span className="text-sm text-inkmut">
                    Chat langsung pemerintah desa
                  </span>
                </span>
              </a>
            )}
            {content.instagram && (
              <a
                href={content.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brass hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-900/5 text-pine-800 transition-colors group-hover:bg-brass group-hover:text-paper">
                  <Instagram className="h-6 w-6" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                    Instagram
                  </span>
                  <span className="text-sm text-inkmut">
                    Ikuti kegiatan & kabar desa
                  </span>
                </span>
              </a>
            )}
            {content.facebook && (
              <a
                href={content.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-pine-700 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-900/5 text-pine-800 transition-colors group-hover:bg-pine-900 group-hover:text-paper">
                  <Facebook className="h-6 w-6" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                    Facebook
                  </span>
                  <span className="text-sm text-inkmut">
                    Kabar & kegiatan desa
                  </span>
                </span>
              </a>
            )}
            {content.tiktok && (
              <a
                href={content.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brass hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pine-900/5 text-pine-800 transition-colors group-hover:bg-brass group-hover:text-paper">
                  <TikTok className="h-6 w-6" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                    TikTok
                  </span>
                  <span className="text-sm text-inkmut">
                    Video pendek seputar desa
                  </span>
                </span>
              </a>
            )}
          </div>

          <div className="mt-4 flex items-start gap-3 border border-line bg-paper2/40 p-5">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-pine-800" />
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                Kantor Desa Sangkima
              </div>
              <p className="text-sm leading-6 text-inkmut">{content.alamat}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
