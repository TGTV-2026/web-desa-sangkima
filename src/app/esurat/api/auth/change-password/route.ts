/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags:
 *       - Account
 *     summary: Change password (requires auth)
 *     description: Ubah password akun. Memerlukan password lama, password baru, dan konfirmasi. Requires authentication.
 *     operationId: changePassword
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *       400:
 *         description: Validasi gagal atau password lama salah
 *       401:
 *         description: Unauthorized - silakan login terlebih dahulu
 */

import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/middlewares/role.middleware";
import { authService } from "@/server/services/auth.service";
import z from "zod";

export async function POST(req: Request) {
  try {
    const auth = await getAuthUser(req);

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - silakan login terlebih dahulu",
        },
        { status: 401 },
      );
    }

    const body = await req.json();

    // userId dari token, bukan dari body (lebih aman)
    const result = await authService.changePassword({
      userId: auth.id,
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
      confirmPassword: body.confirmPassword,
    });

    return NextResponse.json(
      { success: result.success, message: result.message },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    // Error dengan .field (mis. "Password lama salah") disajikan sebagai error field
    // agar form bisa menampilkannya inline, konsisten dengan bentuk errors Zod.
    const field =
      error && typeof error === "object" && "field" in error
        ? (error as { field?: string }).field
        : undefined;

    return NextResponse.json(
      {
        success: false,
        message,
        ...(field ? { errors: { [field]: [message] } } : {}),
      },
      { status: 400 },
    );
  }
}
