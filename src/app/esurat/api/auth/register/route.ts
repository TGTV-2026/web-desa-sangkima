/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Registration Flow
 *     summary: "1️⃣ Register new user account"
 *     description: Register new user with name, email, NIK, and password. Sends OTP to email for verification.
 *     operationId: registerUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - nik
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               nik:
 *                 type: string
 *                 pattern: "^[0-9]{16}$"
 *                 example: "1234567890123456"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *               confirmPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Harus sama persis dengan password
 *                 example: password123
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent to email
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
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Validation failed or email/NIK already registered
 */

import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import { setPendingVerification } from "@/server/utils/session";
import { verifyTurnstile } from "@/server/utils/turnstile";
import z from "zod";

export async function POST(req: Request) {
  try {
    const { turnstileToken, ...body } = (await req.json()) ?? {};

    if (!(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json(
        { success: false, message: "Verifikasi keamanan gagal. Silakan coba lagi." },
        { status: 400 },
      );
    }

    const result = await authService.register(body);

    // Tandai user ini sedang menunggu verifikasi OTP (tahan tab tertutup).
    if (result.data?.userId) {
      await setPendingVerification(String(result.data.userId));
    }

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: result.data,
      },
      { status: 201 },
    );
  } catch (error: any) {
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

    // Email/NIK sudah terdaftar: petakan ke struktur errors per-field yang
    // sama dengan output Zod, agar frontend bisa menampilkan border merah
    // pada input yang tepat tanpa logika tambahan.
    if (error?.field) {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: { [error.field]: [error.message] },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 400 },
    );
  }
}
