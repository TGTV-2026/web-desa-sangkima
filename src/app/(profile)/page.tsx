import Hero from "@/components/profile/Hero";
import Reveal from "@/components/profile/Reveal";
import Seal from "@/components/profile/Seal";
import { ArrowRight, FileText, Store, Trees } from "@/components/profile/icons";

const MISI = [
  {
    no: "01",
    title: "Tata Kelola Modern",
    desc: "Menerapkan sistem administrasi digital yang transparan dan akuntabel untuk pelayanan masyarakat yang prima.",
  },
  {
    no: "02",
    title: "Ekonomi Berkelanjutan",
    desc: "Mendorong pertumbuhan ekonomi desa melalui optimalisasi potensi lokal dan ekowisata berbasis komunitas.",
  },
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

      {/* Visi & Misi */}
      <section id="profil" className="relative bg-paper py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-12">
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
            {/* Judul */}
            <Reveal className="md:col-span-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px w-8 bg-pine-900" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-pine-900">
                  Profil Desa
                </span>
              </div>
              <h2 className="font-serif text-[32px] font-medium leading-[40px] text-pine-900">
                Visi &amp; Misi
                <br />
                Pembangunan
              </h2>
            </Reveal>

            {/* Konten */}
            <Reveal className="md:col-span-8 md:col-start-5" delay={200}>
              <Seal className="bg-card transition-shadow duration-500 hover:shadow-md">
                <div className="p-8 md:p-12">
                  <h3 className="mb-4 font-serif text-[24px] leading-snug text-pine-900">
                    Mewujudkan Desa Sangkima yang Mandiri, Inovatif, dan
                    Berbudaya.
                  </h3>
                  <div className="my-8 h-px w-full bg-line" />
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {MISI.map((m) => (
                      <div key={m.no} className="group">
                        <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-pine-800 text-paper/80 transition-transform duration-300 group-hover:scale-110 group-hover:bg-pine-900 group-hover:text-paper">
                          <span className="font-mono text-xs">{m.no}</span>
                        </div>
                        <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900">
                          {m.title}
                        </h4>
                        <p className="text-sm leading-6 text-inkmut">{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Seal>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Layanan & Potensi */}
      <section
        id="layanan"
        className="relative overflow-hidden border-y border-line bg-card py-24 md:py-32"
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
                <Reveal key={l.title} delay={i * 100}>
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
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
