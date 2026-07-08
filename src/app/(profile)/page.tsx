import Hero from "@/components/profile/Hero";
import Reveal from "@/components/profile/Reveal";
import Seal from "@/components/profile/Seal";
import GallerySection from "@/components/profile/GallerySection";
import ContactSection from "@/components/profile/ContactSection";
import { ArrowRight, FileText, Store, Trees } from "@/components/profile/icons";
import type { CSSProperties } from "react";
import { siteContentService } from "@/server/services/siteContent.service";
import { galleryService } from "@/server/services/gallery.service";
import type { LayananContent } from "@/server/types/content";

// Konten dari CMS — selalu tampilkan versi terbaru.
export const dynamic = "force-dynamic";

// Pemetaan nama ikon (string di DB) → komponen ikon.
const ICONS: Record<LayananContent["items"][number]["icon"], typeof FileText> = {
  FileText,
  Trees,
  Store,
};

// Posisi awal "berserak" tiap kartu layanan untuk animasi assemble (.sd-assemble).
const SCATTER: CSSProperties[] = [
  { "--tx": "-140px", "--ty": "30px", "--rot": "-7deg" } as CSSProperties,
  { "--tx": "0px", "--ty": "-90px", "--rot": "5deg" } as CSSProperties,
  { "--tx": "140px", "--ty": "30px", "--rot": "7deg" } as CSSProperties,
];

export default async function BerandaPage() {
  const hero = await siteContentService.get("hero");
  const layanan = await siteContentService.get("layanan");
  const galeri = await siteContentService.get("galeri");
  const kontak = await siteContentService.get("kontak");
  const albums = await galleryService.listPublishedAlbums(12);

  return (
    <>
      <Hero content={hero} />

      {/* Layanan & Potensi */}
      <section
        id="layanan"
        className="snap-start relative overflow-hidden border-y border-line bg-card py-24 md:py-32"
      >
        {/* aksen latar abstrak */}
        <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/3 rounded-full bg-pine-800/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-12">
          <Reveal className="mb-16 text-center">
            <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
              {layanan.eyebrow}
            </span>
            <h2 className="font-serif text-[32px] font-medium leading-[40px] text-pine-900">
              {layanan.title}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {layanan.items.map((l, i) => {
              const Icon = ICONS[l.icon] ?? FileText;
              return (
                <div
                  key={`${l.title}-${i}`}
                  className="sd-assemble h-full"
                  style={SCATTER[i % SCATTER.length]}
                >
                  <Seal className="group h-full bg-card transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                    <div className="p-8">
                      <div className="mb-6 flex h-12 w-12 items-center border-b border-pine-900 pb-2 text-pine-900 transition-transform duration-300 group-hover:scale-110 group-hover:text-brass">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="mb-3 font-serif text-[20px] text-pine-900 transition-colors duration-300 group-hover:text-brass">
                        {l.title}
                      </h3>
                      <p className="mb-6 text-sm leading-6 text-inkmut">
                        {l.desc}
                      </p>
                      <a
                        href={l.href}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900 transition-colors group-hover:text-brass"
                      >
                        {l.cta}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </Seal>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <GallerySection content={galeri} albums={albums} />

      <ContactSection content={kontak} />
    </>
  );
}
