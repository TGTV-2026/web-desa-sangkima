import { NextResponse } from "next/server";
import { cmsUserService } from "@/server/services/cmsUser.service";

// Endpoint sekali pakai untuk membuat Super Admin CMS pertama setelah deploy
// awal — dibuka lewat browser (bukan terminal), karena super_admin tak bisa
// dibuat lewat UI/kode lain manapun. Nonaktif secara default (butuh
// CMS_SETUP_TOKEN di-set), dan otomatis "mati" sendiri begitu satu super_admin
// aktif sudah ada (lihat cmsUserService.bootstrapSuperAdmin) — aman dibiarkan
// di kode setelah dipakai.
export async function GET(req: Request) {
  const setupToken = process.env.CMS_SETUP_TOKEN;
  if (!setupToken) {
    return NextResponse.json(
      { success: false, message: "Setup tidak diaktifkan." },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get("token") !== setupToken) {
    return NextResponse.json(
      { success: false, message: "Token tidak valid." },
      { status: 401 },
    );
  }

  const email = process.env.CMS_ADMIN_EMAIL;
  const password = process.env.CMS_ADMIN_PASSWORD;
  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        message: "CMS_ADMIN_EMAIL / CMS_ADMIN_PASSWORD belum diset.",
      },
      { status: 500 },
    );
  }

  const result = await cmsUserService.bootstrapSuperAdmin({
    name: process.env.CMS_ADMIN_NAME,
    email,
    password,
  });

  if (!result.created) {
    return NextResponse.json(
      { success: false, message: result.reason },
      { status: 409 },
    );
  }
  return NextResponse.json({
    success: true,
    message: `Super Admin ${email} dibuat. Silakan login di /admin/login.`,
  });
}
