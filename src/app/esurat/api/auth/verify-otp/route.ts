import { pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Registration Flow
 *     summary: "2️⃣ Verify OTP code after registration"
 *     description: Verify OTP code sent to user's email during registration. Marks email as verified and auto-logs in the user.
 *     operationId: verifyOTPAfterRegistration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user_id_123
 *               otp:
 *                 type: string
 *                 pattern: "^[0-9]{4}$"
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: OTP verified successfully, email activated, user logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         nik:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Invalid or expired OTP
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/server/services/auth.service";
import { clearPendingVerification } from "@/server/utils/session";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await authService.verifyOTP(body);

    // Verifikasi selesai — hapus penanda pending agar tidak terjebak di verify-otp.
    await clearPendingVerification();

    // Set cookie login — user langsung masuk tanpa harus ke halaman login lagi.
    const cookieStore = await cookies();
    cookieStore.set({
      name: "access_token",
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 jam — samakan dengan JWT_EXPIRES_IN (1h)
    });

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: { user: result.user, token: result.token },
      },
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

    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Terjadi kesalahan internal server"),
      },
      { status: 400 },
    );
  }
}
