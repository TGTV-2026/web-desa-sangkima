import path from "node:path";
import { NextResponse } from "next/server";
import { serveUploadedFile } from "@/server/utils/serveUpload";

// Selalu eksekusi ulang (baca disk langsung), tidak boleh ikut di-cache Next.js.
export const dynamic = "force-dynamic";

const DIR = path.join(process.cwd(), "uploads", "profil");

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const res = await serveUploadedFile(DIR, filename);
  if (!res) {
    return NextResponse.json(
      { success: false, message: "Berkas tidak ditemukan" },
      { status: 404 },
    );
  }
  return res;
}
