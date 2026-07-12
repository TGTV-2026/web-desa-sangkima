import { formatTanggal } from "@/lib/format";

// Pratinjau berita — meniru layout artikel publik di (profile)/berita/[slug].
// Presentasional murni; dipakai NewsForm saat mode "Pratinjau".
export default function NewsPreview({
  title,
  excerpt,
  content,
  coverImage,
}: {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
}) {
  // Pemisahan paragraf identik halaman publik (pisah pada baris kosong).
  const paragraf = (content ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="card-doc overflow-hidden">
      <div className="border-b border-line bg-paper2/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut">
        Pratinjau — perkiraan tampilan di situs publik
      </div>
      <article className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8 md:px-8">
        <header className="flex flex-col gap-3">
          <span className="font-mono text-xs text-brass">
            {formatTanggal(new Date().toISOString())}
          </span>
          <h1 className="font-serif text-[28px] font-medium leading-[36px] tracking-[-0.01em] text-pine-900 md:text-[40px] md:leading-[48px]">
            {title.trim() || "Judul berita"}
          </h1>
          {excerpt.trim() && (
            <p className="text-[15px] leading-7 text-inkmut">{excerpt}</p>
          )}
        </header>

        {coverImage && (
          <div className="overflow-hidden border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title || "Sampul berita"}
              className="max-h-[420px] w-full object-cover"
            />
          </div>
        )}

        {paragraf.length > 0 ? (
          <div className="flex flex-col gap-4">
            {paragraf.map((p, i) => (
              <p key={i} className="text-[15px] leading-8 text-ink">
                {p}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-[15px] italic leading-8 text-inkmut/60">
            Isi berita akan tampil di sini…
          </p>
        )}
      </article>
    </div>
  );
}
