import { NextResponse } from "next/server";
import { getCmsUser } from "@/server/utils/cmsSession";
import { saveHeroVideo } from "@/server/utils/videoUpload";

// Upload video latar hero (MP4/WEBM). Hanya akun CMS yang emailnya terverifikasi.
export async function POST(req: Request) {
  const user = await getCmsUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Tidak berwenang" },
      { status: 401 },
    );
  }
  if (!user.emailVerified) {
    return NextResponse.json(
      {
        success: false,
        message: "Verifikasi email Anda dulu sebelum mengunggah berkas.",
      },
      { status: 403 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Berkas video tidak ditemukan" },
      { status: 400 },
    );
  }

  try {
    // File diteruskan apa adanya; saveHeroVideo menulisnya dengan stream lalu
    // mengompres via ffmpeg. `compressed` diteruskan ke CMS supaya operator
    // tahu bila kompresi dilewati (ffmpeg tak terpasang di server).
    const hasil = await saveHeroVideo(file);
    return NextResponse.json({ success: true, data: hasil });
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
