import Link from "next/link";
import { notFound } from "next/navigation";
import { galleryService } from "@/server/services/gallery.service";
import AlbumForm from "../AlbumForm";
import AlbumPhotoManager from "../AlbumPhotoManager";
import AlbumVideoManager from "../AlbumVideoManager";

export const dynamic = "force-dynamic";

export default async function AdminAlbumEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await galleryService.getAlbumById(id);
  if (!album) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/album"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Daftar Album
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-pine-900">
          Kelola Album
        </h1>
        {album.published ? (
          <Link
            href={`/galeri/${album.slug}`}
            target="_blank"
            className="mt-1 inline-block text-xs text-brass hover:underline"
          >
            Lihat di situs publik ↗
          </Link>
        ) : (
          <span className="mt-1 inline-block text-xs text-inkmut">
            Draf — belum tampil di publik
          </span>
        )}
      </div>

      <AlbumPhotoManager
        albumId={album.id}
        coverUrl={album.coverImage}
        photos={album.photos}
      />

      <AlbumVideoManager albumId={album.id} videos={album.videos} />

      <div>
        <h2 className="mb-3 font-serif text-xl text-pine-900">Detail Album</h2>
        <AlbumForm initial={album} />
      </div>
    </div>
  );
}
