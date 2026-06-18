/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Registration Flow
 *     summary: "2️⃣ Verify OTP code after registration"
 *     description: Verify OTP code sent to user's email during registration. Marks email as verified.
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
 *         description: OTP verified successfully, email activated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP
 */

import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await authService.verifyOTP(body);

    return NextResponse.json(
      { success: result.success, message: result.message },
      { status: 200 },
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

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 400 },
    );
  }
}
