import Link from "next/link";
import { notFound } from "next/navigation";
import { newsService } from "@/server/services/news.service";
import NewsForm from "../NewsForm";

export const dynamic = "force-dynamic";

export default async function AdminBeritaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const berita = await newsService.getById(id);
  if (!berita) notFound();

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
          Edit Berita
        </h1>
      </div>
      <NewsForm initial={berita} />
    </div>
  );
}
