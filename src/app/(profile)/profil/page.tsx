import type { Metadata } from "next";
import Reveal from "@/components/profile/Reveal";
import Seal from "@/components/profile/Seal";
import { Eye, Person } from "@/components/profile/icons";
import MisiAssemble from "@/components/profile/MisiAssemble";
import StatistikDusunSection from "@/components/profile/StatistikDusunSection";
import { siteContentService } from "@/server/services/siteContent.service";

export const metadata: Metadata = {
  title: "Profil Desa Sangkima — Sejarah, Visi & Misi, Struktur",
  description:
    "Sejarah singkat, visi & misi, dan struktur organisasi Pemerintah Desa Sangkima, Kecamatan Sangatta Selatan, Kabupaten Kutai Timur.",
};

// Konten diambil dari DB (CMS) per request — selalu menampilkan versi terbaru.
export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  // Konten dikelola lewat CMS /admin (fallback ke default bila belum disunting).
  const { sejarah, visi, misi } = await siteContentService.get("profil");
  const { kepalaDesa, aparatur } = await siteContentService.get("struktur");
  const statistikDusun = await siteContentService.get("statistikDusun");

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-24 px-5 pb-24 pt-28 md:px-12 md:pt-32">
      {/* Hero judul */}
      <Reveal className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center border border-line bg-card px-3 py-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Arsip Resmi
          </span>
        </div>
        <h1 className="font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pine-900 md:text-[60px] md:leading-[64px]">
          Profil Desa Sangkima
        </h1>
        <p className="text-sm leading-6 text-inkmut">
          Menyusuri jejak sejarah, memahami arah tujuan, dan mengenal struktur
          administratif yang menggerakkan tatanan masyarakat kami.
        </p>
      </Reveal>

      <div className="h-px w-full bg-line" />

      {/* Sejarah Singkat — editorial 2 kolom */}
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <Reveal className="flex flex-col gap-6 lg:col-span-5 lg:sticky lg:top-28">
          <h2 className="font-serif text-[32px] font-medium leading-[40px] text-pine-900">
            Sejarah Singkat
          </h2>
          <p className="text-sm leading-6 text-inkmut">
            Catatan pembentukan wilayah, perkembangan demografi, hingga
            tonggak-tonggak penting yang membentuk karakter dan tatanan sosial
            masyarakat Desa Sangkima dari masa ke masa.
          </p>
          <Seal className="mt-2 hidden bg-card md:block">
            <div className="overflow-hidden">
              <img
                src="/profile/galeri/hutan-lindung.jpg"
                alt="Lanskap Desa Sangkima dengan hutan dan perbukitan"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover opacity-80 grayscale sd-zoom"
              />
            </div>
          </Seal>
        </Reveal>

        <Reveal
          className="flex flex-col gap-6 border-line lg:col-span-7 lg:border-l lg:pl-10"
          delay={150}
        >
          {sejarah.map((p, i) => (
            <p key={i} className="text-[15px] leading-7 text-ink">
              {p}
            </p>
          ))}
        </Reveal>
      </section>

      <div className="h-px w-full bg-line" />

      {/* Visi & Misi */}
      <section className="flex flex-col">
        <Reveal className="mb-12 flex flex-col items-center gap-4 text-center">
          <Eye className="h-9 w-9 text-brass" />
          <h2 className="font-serif text-[36px] uppercase leading-tight tracking-[0.08em] text-pine-900">
            Visi &amp; Misi
          </h2>
          <div className="h-px w-24 bg-brass" />
        </Reveal>

        <MisiAssemble visi={visi} misi={misi} />
      </section>

      <div className="h-px w-full bg-line" />

      {/* Struktur Organisasi */}
      <section className="flex flex-col gap-10">
        <Reveal className="flex flex-col gap-2">
          <h2 className="font-serif text-[32px] font-medium leading-[40px] text-pine-900">
            Struktur Organisasi
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-inkmut">
            Jajaran aparatur yang bertugas menyelenggarakan roda pemerintahan dan
            memberikan pelayanan administratif kepada warga.
          </p>
        </Reveal>

        {/* Kepala Desa */}
        <Reveal className="w-full md:w-2/3 lg:w-1/2">
          <Seal className="bg-card">
            <div className="flex flex-col items-center gap-6 bg-paper2/30 p-6 sm:flex-row sm:items-start">
              <div className="flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden border border-line bg-card text-inkmut/40">
                {kepalaDesa.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={kepalaDesa.foto}
                    alt={`Foto ${kepalaDesa.nama}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Person className="h-16 w-16" />
                )}
              </div>
              <div className="flex flex-col gap-4 pt-2 text-center sm:text-left">
                <div className="inline-flex self-center border border-pine-900/20 bg-pine-900/5 px-2 py-1 sm:self-start">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pine-900">
                    Kepala Desa
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-[24px] leading-tight text-pine-900">
                    {kepalaDesa.nama}
                  </h3>
                  {kepalaDesa.nip && (
                    <p className="mt-1 font-mono text-xs text-inkmut">
                      {kepalaDesa.nip}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Seal>
        </Reveal>

        {/* Aparatur */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aparatur.map((a, i) => (
            <Reveal key={`${a.jabatan}-${i}`} delay={i * 90}>
              <div className="flex h-full flex-col items-center gap-4 border border-line bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line bg-paper2/40 text-inkmut/40">
                  {a.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.foto}
                      alt={`Foto ${a.nama}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Person className="h-10 w-10" />
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brass">
                    {a.jabatan}
                  </span>
                  <h4 className="font-bold text-ink">{a.nama}</h4>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="h-px w-full bg-line" />

      {/* Statistik Dusun */}
      <StatistikDusunSection content={statistikDusun} />
    </div>
  );
}
