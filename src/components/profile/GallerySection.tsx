// Seksi #galeri: album dokumentasi (carousel) + potensi ekonomi/UMKM (bento).
// Konten galeri kini dari album yang diunggah tim media (bukan koleksi statis).
import Reveal from "./Reveal";
import Seal from "./Seal";
import AlbumCarousel from "./AlbumCarousel";
import { ArrowRight } from "./icons";
import type { GaleriContent } from "@/server/types/content";
import type { AlbumDTO } from "@/server/types/gallery";

export default function GallerySection({
  content,
  albums,
}: {
  content: GaleriContent;
  albums: AlbumDTO[];
}) {
  const { potensiUtama: POTENSI_UTAMA, potensi: POTENSI } = content;

  return (
    <section
      id="galeri"
      className="relative overflow-hidden border-y border-line bg-card py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-12">
        {/* Judul seksi */}
        <Reveal className="mb-16">
          <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            {content.eyebrow}
          </span>
          <h2 className="mb-4 font-serif text-[32px] font-medium leading-[40px] text-pine-900">
            {content.title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-inkmut">
            {content.subtitle}
          </p>
        </Reveal>

        {/* Album dokumentasi (carousel, 3 per halaman, klik → /galeri/<slug>) */}
        <Reveal>
          <AlbumCarousel albums={albums} heading="Koleksi Keindahan Alam" />
        </Reveal>

        {/* Potensi ekonomi & UMKM (bento) */}
        <div className="mt-24">
          <Reveal className="mb-8 border-b border-line pb-4">
            <h3 className="font-serif text-[24px] text-pine-900">
              Potensi Ekonomi &amp; UMKM
            </h3>
            <p className="mt-2 text-sm leading-6 text-inkmut">
              Mendorong kemandirian ekonomi melalui inisiatif lokal.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Fitur utama */}
            <Reveal className="md:col-span-2">
              <Seal className="group flex h-full flex-col bg-card transition-shadow duration-500 hover:shadow-md">
                <div className="relative overflow-hidden">
                  <img
                    src={POTENSI_UTAMA.src}
                    alt={POTENSI_UTAMA.alt}
                    loading="lazy"
                    className="h-64 w-full object-cover sd-zoom md:h-96"
                  />
                  <span className="absolute right-4 top-4 border border-pine-900/20 bg-paper/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900 backdrop-blur">
                    {POTENSI_UTAMA.badge}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-8">
                  <h4 className="mb-4 font-serif text-[24px] text-pine-900 transition-colors group-hover:text-brass">
                    {POTENSI_UTAMA.judul}
                  </h4>
                  <p className="mb-6 text-sm leading-6 text-inkmut">
                    {POTENSI_UTAMA.desc}
                  </p>
                  <a
                    href="#kontak"
                    className="mt-auto inline-flex w-fit items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-brass transition-all hover:gap-3"
                  >
                    {POTENSI_UTAMA.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </Seal>
            </Reveal>

            {/* Fitur sekunder */}
            {POTENSI.map((p, i) => (
              <Reveal key={p.judul} delay={i * 100}>
                <Seal className="group flex h-full flex-col bg-card transition-shadow duration-500 hover:shadow-md">
                  <div className="overflow-hidden">
                    <img
                      src={p.src}
                      alt={p.alt}
                      loading="lazy"
                      className="h-40 w-full object-cover sd-zoom"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h5 className="mb-2 font-bold text-pine-900">{p.judul}</h5>
                    <p className="mb-4 flex-1 text-sm leading-6 text-inkmut">
                      {p.desc}
                    </p>
                    <span className="font-mono text-xs text-brass">{p.tag}</span>
                  </div>
                </Seal>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
