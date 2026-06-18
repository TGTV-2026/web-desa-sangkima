/**
 * @swagger
 * /api/auth/change-email:
 *   post:
 *     tags:
 *       - Email Management Flow
 *     summary: "1️⃣ Request email change (requires auth)"
 *     description: Request to change user's email address. Sends OTP to new email for verification. Requires authentication.
 *     operationId: requestEmailChange
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: OTP sent to new email
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
 *                     newEmail:
 *                       type: string
 *       400:
 *         description: Email already registered or validation failed
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
    const result = await authService.changeEmail({
      userId: authPayload.id,
      newEmail: body.newEmail,
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
