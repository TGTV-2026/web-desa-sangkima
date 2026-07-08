import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/profile/Reveal";
import Seal from "@/components/profile/Seal";
import { galleryService } from "@/server/services/gallery.service";
import { formatTanggal } from "@/lib/format";

export const metadata: Metadata = {
  title: "Galeri Media — Desa Sangkima",
  description:
    "Dokumentasi kegiatan, potret alam, dan footage udara Desa Sangkima oleh tim media desa.",
};

export const dynamic = "force-dynamic";

export default async function GaleriPage() {
  const albums = await galleryService.listPublishedAlbums();

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-5 pb-24 pt-28 md:px-12 md:pt-32">
      <Reveal className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
          Dokumentasi Desa
        </span>
        <h1 className="font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pine-900 md:text-[56px] md:leading-[60px]">
          Galeri Media
        </h1>
        <p className="text-sm leading-6 text-inkmut">
          Kumpulan album foto kegiatan, potret alam, dan footage udara Desa
          Sangkima yang diabadikan tim media desa.
        </p>
      </Reveal>

      <div className="h-px w-full bg-line" />

      {albums.length === 0 ? (
        <p className="py-16 text-center text-sm text-inkmut">Belum ada album.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a, i) => (
            <Reveal key={a.id} delay={i * 80}>
              <Link href={`/galeri/${a.slug}`} className="group block h-full">
                <Seal className="flex h-full flex-col bg-card transition-shadow duration-500 hover:shadow-md">
                  <div className="relative aspect-[16/10] overflow-hidden bg-paper2/40">
                    {a.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-inkmut/30">
                        <span className="font-serif text-lg">Album Desa</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 rounded-full bg-pine-950/80 px-2.5 py-1 text-[11px] font-bold text-paper">
                      {a.photoCount} foto
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-2 font-mono text-xs text-brass">
                      {formatTanggal(a.createdAt?.toISOString())}
                    </span>
                    <h2 className="mb-2 font-serif text-[20px] leading-snug text-pine-900 transition-colors group-hover:text-brass">
                      {a.title}
                    </h2>
                    {a.description && (
                      <p className="line-clamp-2 text-sm leading-6 text-inkmut">
                        {a.description}
                      </p>
                    )}
                    <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-pine-900 transition-colors group-hover:text-brass">
                      Lihat album →
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
