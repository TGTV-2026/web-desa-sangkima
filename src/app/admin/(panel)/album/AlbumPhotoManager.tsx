"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import type { PhotoDTO } from "@/server/types/gallery";
import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/uploadLimits";
import { addAlbumPhoto, deleteAlbumPhoto, setAlbumCover } from "./actions";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX = MAX_IMAGE_BYTES;

export default function AlbumPhotoManager({
  albumId,
  coverUrl,
  photos,
}: {
  albumId: string;
  coverUrl: string | null;
  photos: PhotoDTO[];
}) {
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [pending, startTransition] = useTransition();

  async function uploadOne(file: File): Promise<boolean> {
    if (!ACCEPTED.includes(file.type) || file.size > MAX) return false;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
    const json = (await res.json()) as {
      success: boolean;
      data?: { url: string };
    };
    if (!json.success || !json.data) return false;
    const add = await addAlbumPhoto(albumId, json.data.url);
    return add.success;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setBusy(true);
    setProgress({ done: 0, total: list.length });
    let ok = 0;
    let skipped = 0;
    // berurutan agar progres jelas & tak membebani server upload
    for (const file of list) {
      const success = await uploadOne(file);
      if (success) ok++;
      else skipped++;
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (ok > 0)
      toast(`${ok} foto terunggah.`, "Berhasil", "success");
    if (skipped > 0)
      toast(
        `${skipped} berkas dilewati (harus JPG/PNG/WEBP, maks ${MAX_IMAGE_LABEL}).`,
        "Sebagian dilewati",
        "error",
      );
    router.refresh();
  }

  function hapus(photoId: string) {
    startTransition(async () => {
      const res = await deleteAlbumPhoto(photoId, albumId);
      if (res.success) {
        toast("Foto dihapus.", "Terhapus", "success");
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  function jadikanSampul(photoId: string) {
    startTransition(async () => {
      const res = await setAlbumCover(photoId, albumId);
      if (res.success) {
        toast("Sampul album diperbarui.", "Tersimpan", "success");
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <section className="card-doc flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="label-doc">Foto Album</span>
          <p className="mt-1 text-[11px] text-inkmut">
            {photos.length} foto • JPG/PNG/WEBP. Boleh langsung dari kamera —
            otomatis dikompres agar ringan. Bisa pilih banyak sekaligus.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="btn-primary shrink-0 text-xs disabled:opacity-50"
        >
          {busy
            ? `Mengunggah ${progress.done}/${progress.total}…`
            : "+ Unggah Foto"}
        </button>
      </div>

      {photos.length === 0 ? (
        <p className="rounded-sm border border-dashed border-line bg-paper2/30 px-5 py-10 text-center text-sm text-inkmut">
          Belum ada foto. Klik “Unggah Foto” untuk menambahkan.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => {
            const isCover = coverUrl === p.url;
            return (
              <div
                key={p.id}
                className="group relative aspect-square overflow-hidden rounded-sm border border-line bg-paper2/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {isCover && (
                  <span className="absolute left-1.5 top-1.5 rounded-sm bg-pine-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-paper">
                    Sampul
                  </span>
                )}
                {/* Aksi (muncul saat hover / selalu di layar sentuh) */}
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => jadikanSampul(p.id)}
                    disabled={pending || isCover}
                    className="rounded-sm bg-white/90 px-2 py-1 text-[10px] font-bold text-pine-900 disabled:opacity-40"
                  >
                    {isCover ? "Sampul" : "Jadikan sampul"}
                  </button>
                  <button
                    type="button"
                    onClick={() => hapus(p.id)}
                    disabled={pending}
                    className="rounded-sm bg-oxide px-2 py-1 text-[10px] font-bold text-white disabled:opacity-40"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
