import type { Metadata } from "next";
import Reveal from "@/components/profile/Reveal";
import Seal from "@/components/profile/Seal";
import { Eye } from "@/components/profile/icons";
import MisiAssemble from "@/components/profile/MisiAssemble";
import StrukturOrg from "@/components/profile/StrukturOrg";
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
  const { groups } = await siteContentService.get("struktur");
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
            Jajaran lembaga desa yang menyelenggarakan roda pemerintahan dan
            pelayanan warga. Pilih grup untuk melihat susunannya.
          </p>
        </Reveal>

        <Reveal>
          <StrukturOrg groups={groups} />
        </Reveal>
      </section>

      <div className="h-px w-full bg-line" />

      {/* Statistik Dusun */}
      <StatistikDusunSection content={statistikDusun} />
    </div>
  );
}
