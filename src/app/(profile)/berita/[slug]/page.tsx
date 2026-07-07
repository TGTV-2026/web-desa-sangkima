import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { newsService } from "@/server/services/news.service";
import { formatTanggal } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await newsService.getBySlug(slug);
  if (!b) return { title: "Berita tidak ditemukan" };
  return {
    title: `${b.title} — Desa Sangkima`,
    description: b.excerpt ?? undefined,
  };
}

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = await newsService.getBySlug(slug);
  if (!b || !b.published) notFound();

  const paragraf = (b.content ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8 px-5 pb-24 pt-28 md:px-8 md:pt-32">
      <Link
        href="/berita"
        className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
      >
        ← Semua Berita
      </Link>

      <header className="flex flex-col gap-4">
        <span className="font-mono text-xs text-brass">
          {formatTanggal(b.publishedAt?.toISOString())}
        </span>
        <h1 className="font-serif text-[32px] font-medium leading-[40px] tracking-[-0.01em] text-pine-900 md:text-[44px] md:leading-[52px]">
          {b.title}
        </h1>
        {b.excerpt && (
          <p className="text-[15px] leading-7 text-inkmut">{b.excerpt}</p>
        )}
      </header>

      {b.coverImage && (
        <div className="overflow-hidden border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.coverImage}
            alt={b.title}
            className="max-h-[520px] w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-5">
        {paragraf.map((p, i) => (
          <p key={i} className="text-[15px] leading-8 text-ink">
            {p}
          </p>
        ))}
      </div>
    </article>
  );
}
