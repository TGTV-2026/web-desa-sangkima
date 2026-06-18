/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Login Flow
 *     summary: "🚪 Logout"
 *     description: Menghapus cookie access_token sehingga sesi browser berakhir.
 *     responses:
 *       200:
 *         description: Logout berhasil
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "access_token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json(
    { success: true, message: "Logout berhasil" },
    { status: 200 },
  );
}
