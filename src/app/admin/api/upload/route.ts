import { NextResponse } from "next/server";
import { getCmsUser } from "@/server/utils/cmsSession";
import { saveProfileImage } from "@/server/utils/imageUpload";

// Upload gambar konten web profil. Hanya akun CMS (super_admin/editor).
export async function POST(req: Request) {
  const user = await getCmsUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Tidak berwenang" },
      { status: 401 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Berkas gambar tidak ditemukan" },
      { status: 400 },
    );
  }
  // "graphic" = tanda tangan/logo yang harus tetap PNG (dipakai pdf-lib).
  const variant = form.get("variant") === "graphic" ? "graphic" : "photo";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveProfileImage(
      { mime: file.type, size: file.size, buffer },
      { variant },
    );
    return NextResponse.json({ success: true, data: { url } });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal mengunggah",
      },
      { status: 400 },
    );
  }
}
