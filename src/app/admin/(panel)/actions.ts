"use server";
import { pesanAksi } from "@/server/utils/appError";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { siteContentService } from "@/server/services/siteContent.service";
import { requireVerifiedCmsUser } from "@/server/utils/cmsSession";
import { deleteHeroVideo } from "@/server/utils/videoUpload";
import { catatAksiCms } from "@/server/utils/audit";
import { CONTENT_SECTIONS, type ContentKey } from "@/server/types/content";

// Path publik yang perlu di-revalidate setelah satu seksi disimpan, agar
// perubahan langsung tampil (Server Component publik mengambil ulang konten).
const REVALIDATE: Record<ContentKey, string[]> = {
  profil: ["/profil"],
  struktur: ["/profil"],
  kontak: ["/"],
  galeri: ["/"],
  hero: ["/"],
  layanan: ["/"],
  footer: ["/", "/profil"],
  surat: [], // dipakai saat generate PDF surat, tak ada halaman publik untuk di-revalidate
  ppid: ["/ppid"],
  produk: ["/produk"],
  statistikDusun: ["/profil"],
};

export type SaveResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> };

/**
 * Simpan satu seksi konten web profil. Dipanggil dari form editor (client).
 * Guard + validasi Zod di service; mengembalikan error per-field bila gagal.
 */
export async function saveSection(
  key: ContentKey,
  value: unknown,
): Promise<SaveResult> {
  if (!(key in CONTENT_SECTIONS)) {
    return { success: false, message: "Seksi tidak dikenal" };
  }

  try {
    const user = await requireVerifiedCmsUser();
    // Tanda tangan surat bersifat sensitif — hanya super admin, bukan editor.
    if (key === "surat" && user.role !== "super_admin") {
      return {
        success: false,
        message: "Hanya Super Admin yang boleh mengubah tanda tangan surat.",
      };
    }
    // Video hero di-host sendiri dan bisa ratusan MB. Bila diganti/dikosongkan,
    // berkas lamanya harus ikut dihapus — kalau tidak, volume uploads terus
    // menumpuk berkas yatim yang tak dipakai siapa pun.
    const videoLama =
      key === "hero" ? (await siteContentService.get("hero")).backgroundVideo : "";

    await siteContentService.update(key, value, user.id);
    await catatAksiCms(user, "content.update", {
      targetType: "Konten",
      targetId: key,
      summary: `Memperbarui konten publik "${CONTENT_SECTIONS[key].label}".`,
      metadata: { key },
    });

    if (key === "hero") {
      const videoBaru =
        (value as { backgroundVideo?: string }).backgroundVideo ?? "";
      if (videoLama && videoLama !== videoBaru) {
        await deleteHeroVideo(videoLama);
      }
    }

    for (const path of REVALIDATE[key]) revalidatePath(path);
    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        message: "Periksa kembali isian — ada yang belum valid.",
        errors: err.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    return {
      success: false,
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
}
