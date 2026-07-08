import Link from "next/link";
import { galleryService } from "@/server/services/gallery.service";
import AlbumList from "./AlbumList";

export const dynamic = "force-dynamic";

export default async function AdminAlbumPage() {
  const items = await galleryService.listAllAlbums();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="overline-doc text-brass">Divisi Media</span>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            Album Galeri
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
            Buat album lalu unggah banyak foto sekaligus (drone, kegiatan, dll).
            Tampil di <span className="font-mono text-xs">/galeri</span> &amp;
            beranda.
          </p>
        </div>
        <Link href="/admin/album/baru" className="btn-primary shrink-0">
          + Tambah Album
        </Link>
      </div>

      <AlbumList items={items} />
    </div>
  );
}
