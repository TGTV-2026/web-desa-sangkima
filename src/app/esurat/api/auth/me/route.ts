/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Profile
 *     summary: "👤 Get current user profile (requires auth)"
 *     description: Retrieve current authenticated user's profile information. Requires valid JWT token.
 *     operationId: getCurrentUserProfile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nik:
 *                       type: string
 *                     role:
 *                       type: string
 *                     positionId:
 *                       type: string
 *                       nullable: true
 *                     address:
 *                       type: string
 *                       nullable: true
 *                     birthday:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     gender:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Unauthorized - invalid or expired token
 *       404:
 *         description: User not found
 */

import { NextResponse } from "next/server";
import { getAuthUser } from "@/server/middlewares/role.middleware";
import { userRepository } from "@/server/repositories/user.repository";

export async function GET(req: Request) {
  try {
    // Verifikasi sesi: terima Bearer header maupun cookie access_token,
    // dan tolak akun nonaktif (deletedAt) — konsisten dengan route lain.
    const auth = await getAuthUser(req);

    if (!auth) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - token tidak valid atau expired",
        },
        { status: 401 },
      );
    }

    // Get user from database
    const user = await userRepository.findById(auth.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        { status: 404 },
      );
    }

    // Return user info (exclude password)
    return NextResponse.json(
      {
        success: true,
        message: "User berhasil diambil",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          nik: user.nik,
          role: user.role,
          positionId: user.positionId,
          address: user.address,
          birthday: user.birthday,
          placeOfBirth: user.placeOfBirth,
          job: user.job,
          gender: user.gender,
          telp: user.telp,
          citizenship: user.citizenship,
          status: user.status,
          education: user.education,
          religion: user.religion,
          emailVerifiedAt: user.emailVerifiedAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal server",
      },
      { status: 500 },
    );
  }
}
