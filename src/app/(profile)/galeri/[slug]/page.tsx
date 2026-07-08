import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AlbumLightbox from "@/components/profile/AlbumLightbox";
import { galleryService } from "@/server/services/gallery.service";
import { formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await galleryService.getAlbumBySlug(slug);
  if (!a) return { title: "Album tidak ditemukan" };
  return {
    title: `${a.title} — Galeri Desa Sangkima`,
    description: a.description ?? undefined,
  };
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await galleryService.getAlbumBySlug(slug);
  if (!album || !album.published) notFound();

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 pb-24 pt-28 md:px-12 md:pt-32">
      <Link
        href="/galeri"
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
      >
        ← Semua Album
      </Link>

      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs text-brass">
          {formatTanggal(album.createdAt?.toISOString())} · {album.photoCount} foto
        </span>
        <h1 className="font-serif text-[32px] font-medium leading-[40px] tracking-[-0.01em] text-pine-900 md:text-[44px] md:leading-[52px]">
          {album.title}
        </h1>
        {album.description && (
          <p className="max-w-2xl text-[15px] leading-7 text-inkmut">
            {album.description}
          </p>
        )}
        {album.authorName && (
          <p className="text-[13px] text-inkmut">
            Didokumentasikan oleh{" "}
            <span className="font-semibold text-ink">{album.authorName}</span>
          </p>
        )}
      </header>

      <div className="h-px w-full bg-line" />

      <AlbumLightbox photos={album.photos} />
    </div>
  );
}
