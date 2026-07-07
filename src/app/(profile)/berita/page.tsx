import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/profile/Reveal";
import Seal from "@/components/profile/Seal";
import { newsService } from "@/server/services/news.service";
import { formatTanggal } from "@/lib/format";

export const metadata: Metadata = {
  title: "Berita & Pengumuman — Desa Sangkima",
  description:
    "Kabar terbaru, pengumuman, dan kegiatan Pemerintah Desa Sangkima.",
};

export const dynamic = "force-dynamic";

export default async function BeritaPage() {
  const berita = await newsService.listPublished();

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-5 pb-24 pt-28 md:px-12 md:pt-32">
      <Reveal className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
          Kabar Desa
        </span>
        <h1 className="font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pine-900 md:text-[56px] md:leading-[60px]">
          Berita &amp; Pengumuman
        </h1>
        <p className="text-sm leading-6 text-inkmut">
          Informasi kegiatan, pengumuman resmi, dan kabar terbaru dari Desa
          Sangkima.
        </p>
      </Reveal>

      <div className="h-px w-full bg-line" />

      {berita.length === 0 ? (
        <p className="py-16 text-center text-sm text-inkmut">
          Belum ada berita.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {berita.map((b, i) => (
            <Reveal key={b.id} delay={i * 80}>
              <Link href={`/berita/${b.slug}`} className="group block h-full">
                <Seal className="flex h-full flex-col bg-card transition-shadow duration-500 hover:shadow-md">
                  <div className="aspect-[16/10] overflow-hidden bg-paper2/40">
                    {b.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.coverImage}
                        alt={b.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-inkmut/30">
                        <span className="font-serif text-lg">Desa Sangkima</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-2 font-mono text-xs text-brass">
                      {formatTanggal(b.publishedAt?.toISOString())}
                    </span>
                    <h2 className="mb-2 font-serif text-[20px] leading-snug text-pine-900 transition-colors group-hover:text-brass">
                      {b.title}
                    </h2>
                    {b.excerpt && (
                      <p className="line-clamp-3 text-sm leading-6 text-inkmut">
                        {b.excerpt}
                      </p>
                    )}
                    <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900 transition-colors group-hover:text-brass">
                      Baca selengkapnya →
                    </span>
                  </div>
                </Seal>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
