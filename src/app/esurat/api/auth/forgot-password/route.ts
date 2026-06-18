/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Password Reset Flow
 *     summary: "1️⃣ Request password reset"
 *     description: Request password reset by providing registered email. Sends reset link to email. Returns generic message for security.
 *     operationId: requestPasswordReset
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
 *         description: Reset request processed (returns generic message for security)
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
 *         description: Email not verified yet or validation failed
 */

import { NextResponse } from "next/server";
import { authService } from "@/server/services/auth.service";
import z from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await authService.forgotPassword(body);

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        ...("_dev" in result && result._dev && { _dev: result._dev }),
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
