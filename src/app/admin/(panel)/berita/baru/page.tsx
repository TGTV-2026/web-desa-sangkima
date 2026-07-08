import Link from "next/link";
import NewsForm from "../NewsForm";

export default function AdminBeritaBaruPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/berita"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Daftar Berita
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-pine-900">
          Tambah Berita
        </h1>
      </div>
      <NewsForm />
    </div>
  );
}
