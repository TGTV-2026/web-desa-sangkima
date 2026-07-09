"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { parseVideoUrl, type VideoDTO } from "@/server/types/gallery";
import { addAlbumVideo, deleteAlbumVideo } from "./actions";

const PLATFORM_LABEL: Record<VideoDTO["platform"], string> = {
  youtube: "YouTube",
  instagram: "Instagram",
};

export default function AlbumVideoManager({
  albumId,
  videos,
}: {
  albumId: string;
  videos: VideoDTO[];
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  async function tambah() {
    const trimmed = url.trim();
    if (!trimmed) return;
    // Validasi instan pakai parser yang sama dengan server, biar feedback cepat.
    if (!parseVideoUrl(trimmed)) {
      toast(
        "Gunakan link YouTube atau Instagram yang valid.",
        "Link tidak dikenali",
        "error",
      );
      return;
    }
    setBusy(true);
    const res = await addAlbumVideo(albumId, trimmed, caption.trim() || undefined);
    setBusy(false);
    if (res.success) {
      setUrl("");
      setCaption("");
      toast("Video ditambahkan.", "Berhasil", "success");
      router.refresh();
    } else {
      toast(res.message, "Gagal", "error");
    }
  }

  function hapus(videoId: string) {
    startTransition(async () => {
      const res = await deleteAlbumVideo(videoId, albumId);
      if (res.success) {
        toast("Video dihapus.", "Terhapus", "success");
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <section className="card-doc flex flex-col gap-4 p-6">
      <div>
        <span className="label-doc">Video Album</span>
        <p className="mt-1 text-[11px] text-inkmut">
          {videos.length} video • Tempel link YouTube atau Instagram. Video tidak
          diunggah ke server — hanya direferensikan dari platform aslinya.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtu.be/… atau https://instagram.com/reel/…"
          className="input-doc"
          disabled={busy}
        />
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Keterangan (opsional)"
          className="input-doc"
          disabled={busy}
        />
        <button
          type="button"
          onClick={tambah}
          disabled={busy || !url.trim()}
          className="btn-primary self-start text-xs disabled:opacity-50"
        >
          {busy ? "Menambahkan…" : "+ Tambah Video"}
        </button>
      </div>

      {videos.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line bg-paper2/30 px-5 py-10 text-center text-sm text-inkmut">
          Belum ada video. Tempel link YouTube/Instagram lalu klik “Tambah Video”.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {videos.map((v) => (
            <div
              key={v.id}
              className="group relative aspect-video overflow-hidden rounded-sm border border-line bg-paper2/40"
            >
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.thumbnailUrl}
                  alt={v.caption ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-brass">
                    {PLATFORM_LABEL[v.platform]}
                  </span>
                  {v.caption && (
                    <span className="line-clamp-2 text-[11px] text-inkmut">
                      {v.caption}
                    </span>
                  )}
                </div>
              )}
              <span className="absolute left-1.5 top-1.5 rounded-sm bg-pine-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-paper">
                {PLATFORM_LABEL[v.platform]}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex justify-end bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => hapus(v.id)}
                  disabled={pending}
                  className="rounded-sm bg-oxide px-2 py-1 text-[10px] font-bold text-white disabled:opacity-40"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
