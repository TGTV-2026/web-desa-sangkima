/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Password Reset Flow
 *     summary: "2️⃣ Apply new password with token"
 *     description: Reset password using userId, reset token, and new password. Token obtained from forgot-password email link.
 *     operationId: applyPasswordReset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user_id_123
 *               token:
 *                 type: string
 *                 example: reset_token_hash
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: newpassword123
 *               confirmPassword:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *         description: Invalid token or validation failed
 *       404:
 *         description: User not found
 */

import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await authService.resetPassword(body);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
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
