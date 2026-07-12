import { AppError, pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Login Flow
 *     summary: "🔐 Login with credentials"
 *     description: Authenticate user with email and password. Returns JWT token and sets access_token cookie. Email must be verified first.
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
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
 *         description: Validation failed or invalid credentials
 *       401:
 *         description: Invalid email or password
 */

// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/server/services/auth.service";
import { setPendingVerification } from "@/server/utils/session";
import { verifyTurnstile } from "@/server/utils/turnstile";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { turnstileToken, ...body } = (await req.json()) ?? {};

    if (!(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json(
        { success: false, message: "Verifikasi keamanan gagal. Silakan coba lagi." },
        { status: 400 },
      );
    }

    const result = await authService.login(body);
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
        success: true,
        message: "Login berhasil",
        data: {
          user: result.user,
          token: result.token,
        },
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

    // Kredensial benar tapi email belum diverifikasi: tandai sesi pending dan
    // beri kode khusus agar klien mengarahkan user ke halaman verifikasi OTP.
    if (error instanceof AppError && error.code === "EMAIL_NOT_VERIFIED" && error.userId) {
      await setPendingVerification(String(error.userId));
      return NextResponse.json(
        {
          success: false,
          code: "EMAIL_NOT_VERIFIED",
          message: error.message,
          data: { userId: error.userId },
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: pesanAman(error, "Terjadi kesalahan internal server"),
      },
      { status: 401 },
    );
  }
}
