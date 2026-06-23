import Hero from "@/components/profile/Hero";
import Reveal from "@/components/profile/Reveal";
import Seal from "@/components/profile/Seal";
import GallerySection from "@/components/profile/GallerySection";
import ContactSection from "@/components/profile/ContactSection";
import { ArrowRight, FileText, Store, Trees } from "@/components/profile/icons";
import type { CSSProperties } from "react";

// Posisi awal "berserak" tiap kartu layanan untuk animasi assemble (.sd-assemble).
const SCATTER: CSSProperties[] = [
  { "--tx": "-140px", "--ty": "30px", "--rot": "-7deg" } as CSSProperties,
  { "--tx": "0px", "--ty": "-90px", "--rot": "5deg" } as CSSProperties,
  { "--tx": "140px", "--ty": "30px", "--rot": "7deg" } as CSSProperties,
];

const LAYANAN = [
  {
    icon: FileText,
    title: "Administrasi Digital",
    desc: "Pengurusan surat pengantar, perizinan, dan dokumen kependudukan secara efisien melalui portal satu pintu.",
    cta: "Akses Layanan",
    href: "/esurat",
  },
  {
    icon: Trees,
    title: "Ekowisata",
    desc: "Jelajahi keindahan alam tersembunyi Sangkima. Area konservasi, jalur tracking, dan wisata budaya lokal.",
    cta: "Lihat Destinasi",
    href: "#galeri",
  },
  {
    icon: Store,
    title: "Potensi Lokal",
    desc: "Dukung produk unggulan UMKM desa. Dari kerajinan tangan tradisional hingga hasil bumi berkualitas.",
    cta: "Katalog UMKM",
    href: "#galeri",
  },
];

export default function BerandaPage() {
  return (
    <>
      <Hero />

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
              Fasilitas Utama
            </span>
            <h2 className="font-serif text-[32px] font-medium leading-[40px] text-pine-900">
              Layanan &amp; Potensi
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {LAYANAN.map((l, i) => {
              const Icon = l.icon;
              return (
                <div
                  key={l.title}
                  className="sd-assemble h-full"
                  style={SCATTER[i]}
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

      <GallerySection />

      <ContactSection />
    </>
  );
}
