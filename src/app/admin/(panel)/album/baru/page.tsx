import Link from "next/link";
import AlbumForm from "../AlbumForm";

export default function AdminAlbumBaruPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/album"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Daftar Album
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-pine-900">
          Tambah Album
        </h1>
        <p className="mt-2 text-sm text-inkmut">
          Isi judul dulu, lalu kamu diarahkan ke halaman untuk mengunggah foto.
        </p>
      </div>
      <AlbumForm />
    </div>
  );
}
