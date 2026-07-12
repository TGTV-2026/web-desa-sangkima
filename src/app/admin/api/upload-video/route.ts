import { pesanAman } from "@/server/utils/appError";
import { NextResponse } from "next/server";
import { MAX_VIDEO_BYTES, MAX_VIDEO_LABEL } from "@/lib/uploadLimits";
import { getCmsUser } from "@/server/utils/cmsSession";
import { saveHeroVideo } from "@/server/utils/videoUpload";

// Berkas dikirim sebagai raw body (bukan FormData) supaya bisa dialirkan
// langsung ke disk: `req.formData()` menumpuk seluruh berkas di memori, dan
// video hero boleh sampai 500 MB. Klien memakai XMLHttpRequest agar bisa
// menampilkan progres unggah.
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

  const mime = req.headers.get("content-type")?.split(";")[0].trim() ?? "";
  if (!req.body) {
    return NextResponse.json(
      { success: false, message: "Berkas video tidak ditemukan" },
      { status: 400 },
    );
  }

  // Tolak lebih awal bila pengirim jujur soal ukurannya; batas sesungguhnya
  // tetap ditegakkan saat data mengalir (Content-Length bisa dipalsukan).
  const panjang = Number(req.headers.get("content-length"));
  if (Number.isFinite(panjang) && panjang > MAX_VIDEO_BYTES) {
    return NextResponse.json(
      { success: false, message: `Ukuran video melebihi ${MAX_VIDEO_LABEL}` },
      { status: 413 },
    );
  }

  try {
    const hasil = await saveHeroVideo({ mime, body: req.body });
    return NextResponse.json({ success: true, data: hasil });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: pesanAman(err, "Gagal mengunggah"),
      },
      { status: 400 },
    );
  }
}
