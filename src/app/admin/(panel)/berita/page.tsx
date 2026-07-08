import Link from "next/link";
import { newsService } from "@/server/services/news.service";
import NewsList from "./NewsList";

export const dynamic = "force-dynamic";

export default async function AdminBeritaPage() {
  const items = await newsService.listAll();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="overline-doc text-brass">Konten</span>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            Berita &amp; Pengumuman
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
            Tampil di halaman{" "}
            <span className="font-mono text-xs">/berita</span>.
          </p>
        </div>
        <Link href="/admin/berita/baru" className="btn-primary shrink-0">
          + Tambah Berita
        </Link>
      </div>

      <NewsList items={items} />
    </div>
  );
}
