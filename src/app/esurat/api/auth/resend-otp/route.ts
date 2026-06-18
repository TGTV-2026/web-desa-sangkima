/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags:
 *       - Registration Flow
 *     summary: "3️⃣ Resend OTP code (if didn't receive)"
 *     description: Request new OTP code to be sent to user's email. Used when user doesn't receive the initial OTP.
 *     operationId: resendOTPCode
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
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
 *       400:
 *         description: Email already verified or validation failed
 *       404:
 *         description: Email not registered
 */

import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await authService.resendOTP(body);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: result.data,
      },
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
