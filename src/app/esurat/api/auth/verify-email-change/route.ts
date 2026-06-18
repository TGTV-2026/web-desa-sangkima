/**
 * @swagger
 * /api/auth/verify-email-change:
 *   post:
 *     tags:
 *       - Email Management Flow
 *     summary: "2️⃣ Verify email change with OTP (requires auth)"
 *     description: Verify email change using OTP sent to new email. Applies the email change if OTP is valid. Requires authentication.
 *     operationId: verifyEmailChange
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 pattern: "^[0-9]{4}$"
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Email changed successfully
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
 *                     newEmail:
 *                       type: string
 *       400:
 *         description: Invalid or expired OTP
 *       401:
 *         description: Unauthorized - please login first
 */

import { NextResponse } from "next/server";
import { verifyAuth } from "@/server/middlewares/auth.middleware";
import { authService } from "@/server/services/auth.service";
import z from "zod";

export async function POST(req: Request) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    const authPayload = await verifyAuth(authHeader || undefined);

    if (!authPayload) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - silakan login terlebih dahulu",
        },
        { status: 401 },
      );
    }

    const body = await req.json();

    // Use userId dari token, bukan dari body (lebih aman)
    const result = await authService.verifyEmailChange({
      userId: authPayload.id,
      otp: body.otp,
    });

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
