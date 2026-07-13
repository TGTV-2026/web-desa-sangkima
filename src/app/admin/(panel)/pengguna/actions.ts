"use server";
import { pesanAksi } from "@/server/utils/appError";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cmsUserService } from "@/server/services/cmsUser.service";
import { siteContentService } from "@/server/services/siteContent.service";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { catatAksiCms } from "@/server/utils/audit";
import type { BulkRtResult } from "@/server/types/cmsUser";

export type CmsUserResult =
  | { success: true }
  | { success: false; message: string };

export type BulkRtActionResult =
  | { success: true; hasil: BulkRtResult }
  | { success: false; message: string };

const KOLOM_CSV = ["nama", "email", "dusun", "rt", "sandi"] as const;

/** Parser CSV sederhana: baris pertama header, nilai boleh dikutip ganda. */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];

  const splitBaris = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let dalamKutip = false;
    for (const ch of line) {
      if (ch === '"') dalamKutip = !dalamKutip;
      else if (ch === "," && !dalamKutip) {
        out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };

  const header = splitBaris(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const nilai = splitBaris(line);
    const row: Record<string, string> = {};
    header.forEach((h, i) => {
      row[h] = nilai[i] ?? "";
    });
    return row;
  });
}

/**
 * Buat akun Ketua RT massal dari isi CSV (nama,email,dusun,rt,sandi).
 * Sandi di CSV bersifat sementara — akun dipaksa menggantinya saat login
 * pertama. Baris gagal dilaporkan per-baris; baris valid tetap dibuat.
 */
export async function bulkCreateRtFromCsv(
  csvText: string,
): Promise<BulkRtActionResult> {
  const me = await requireSuperAdmin();
  try {
    const rows = parseCsv(csvText);
    if (rows.length === 0) {
      return {
        success: false,
        message: "CSV kosong atau hanya berisi header.",
      };
    }
    const kolomAda = Object.keys(rows[0]);
    const kurang = KOLOM_CSV.filter((k) => !kolomAda.includes(k));
    if (kurang.length > 0) {
      return {
        success: false,
        message: `Kolom CSV kurang: ${kurang.join(", ")}. Wajib: ${KOLOM_CSV.join(",")}`,
      };
    }

    // Nama dusun divalidasi terhadap daftar kanonik statistik publik supaya
    // rekap laporan RT nanti pasti cocok dengan statistik dusun.
    const statistik = await siteContentService.get("statistikDusun");
    const hasil = await cmsUserService.bulkCreateRt(rows, {
      dusunValid: statistik.dusun.map((d) => d.nama),
    });
    await catatAksiCms(me, "cms_user.bulk_create_rt", {
      targetType: "Akun RT",
      summary: `Membuat ${hasil.dibuat.length} akun Ketua RT via unggah CSV${
        hasil.gagal.length ? ` (${hasil.gagal.length} baris gagal)` : ""
      }.`,
      metadata: { dibuat: hasil.dibuat.length, gagal: hasil.gagal.length },
    });
    revalidatePath("/admin/pengguna");
    return { success: true, hasil };
  } catch (err) {
    return { success: false, message: pesanAksi(err, "Gagal memproses CSV.") };
  }
}

export async function createCmsUser(input: unknown): Promise<CmsUserResult> {
  const me = await requireSuperAdmin();
  try {
    const created = await cmsUserService.create(input);
    await catatAksiCms(me, "cms_user.create", {
      targetType: "Akun CMS",
      targetId: created.id,
      summary: `Membuat akun editor: ${created.email}.`,
    });
    revalidatePath("/admin/pengguna");
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
  redirect("/admin/pengguna");
}

export async function updateCmsUser(
  id: string,
  input: unknown,
): Promise<CmsUserResult> {
  const me = await requireSuperAdmin();
  try {
    await cmsUserService.update(id, input);
    await catatAksiCms(me, "cms_user.update", {
      targetType: "Akun CMS",
      targetId: id,
      summary: `Mengubah data akun CMS (${id}).`,
    });
    revalidatePath("/admin/pengguna");
    revalidatePath(`/admin/pengguna/${id}`);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { success: false, message: "Periksa isian — ada yang belum valid." };
    }
    return {
      success: false,
      message: pesanAksi(err, "Gagal menyimpan."),
    };
  }
  redirect("/admin/pengguna");
}

export async function setCmsUserActive(
  id: string,
  active: boolean,
): Promise<CmsUserResult> {
  const me = await requireSuperAdmin();
  // Cegah menonaktifkan diri sendiri (bisa terkunci keluar).
  if (!active && id === me.id) {
    return { success: false, message: "Tidak bisa menonaktifkan akun sendiri." };
  }
  try {
    if (active) await cmsUserService.reactivate(id);
    else await cmsUserService.deactivate(id);
    await catatAksiCms(me, active ? "cms_user.reactivate" : "cms_user.deactivate", {
      targetType: "Akun CMS",
      targetId: id,
      summary: active
        ? `Mengaktifkan ulang akun CMS (${id}).`
        : `Menonaktifkan akun CMS (${id}).`,
    });
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal memperbarui."),
    };
  }
}

export async function deleteCmsUser(id: string): Promise<CmsUserResult> {
  const me = await requireSuperAdmin();
  if (id === me.id) {
    return { success: false, message: "Tidak bisa menghapus akun sendiri." };
  }
  try {
    await cmsUserService.hardDelete(id);
    await catatAksiCms(me, "cms_user.delete", {
      targetType: "Akun CMS",
      targetId: id,
      summary: `Menghapus permanen akun CMS (${id}).`,
    });
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: pesanAksi(err, "Gagal menghapus."),
    };
  }
}
