import { NextResponse } from "next/server";
import { getCmsUser } from "@/server/utils/cmsSession";
import { saveDocument } from "@/server/utils/documentUpload";

// Upload dokumen PPID (PDF/gambar). Hanya akun CMS (super_admin/editor).
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
      { success: false, message: "Berkas tidak ditemukan" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveDocument({
      mime: file.type,
      size: file.size,
      buffer,
    });
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
