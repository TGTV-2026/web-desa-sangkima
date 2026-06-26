/**
 * @swagger
 * /api/auth/test-email:
 *   post:
 *     tags:
 *       - Utilities
 *     summary: "🧪 Test email configuration (admin)"
 *     description: Test email configuration by sending a test email via Resend. Development/debugging purpose only. Admin only.
 *     operationId: testEmailConfig
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - testEmail
 *             properties:
 *               testEmail:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *     responses:
 *       200:
 *         description: Test email sent successfully
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
 *         description: Missing testEmail parameter or send failed
 */

import { NextResponse } from "next/server";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";
import { Resend } from "resend";

export async function POST(req: Request) {
  // endpoint utilitas: hanya admin, agar tidak bisa dipakai spam email
  try {
    await requireRole(req, ["admin"]);
  } catch (error) {
    return handleACLError(error);
  }

  try {
    const body = await req.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "testEmail parameter diperlukan",
        },
        { status: 400 },
      );
    }

    // Console mode — tidak ada API key
    if (!process.env.RESEND_API_KEY || process.env.EMAIL_MODE === "console") {
      console.log("\n🧪 TEST EMAIL (Console Mode)");
      console.log(`   To: ${testEmail}`);
      console.log(
        `   Status: Tidak ada RESEND_API_KEY — email tidak dikirim\n`,
      );

      return NextResponse.json(
        {
          success: true,
          message: "Console mode — set RESEND_API_KEY di .env untuk kirim email sungguhan",
          mode: "console",
          info: {
            email: testEmail,
            note: "Email tidak dikirim, ditampilkan di console",
          },
        },
        { status: 200 },
      );
    }

    // Kirim test email via Resend
    console.log("\n🧪 Testing Resend Configuration...");
    console.log(`   From: ${process.env.RESEND_FROM_EMAIL}`);
    console.log(`   To:   ${testEmail}`);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: testEmail,
      subject: "Test Email - Desa Sangkima OTP System",
      html: `
        <h2>Test Email</h2>
        <p>Jika Anda menerima email ini, berarti konfigurasi Resend sudah benar! ✅</p>
        <p>
          <strong>Info:</strong><br>
          From: ${process.env.RESEND_FROM_EMAIL}<br>
          Time: ${new Date().toLocaleString("id-ID")}
        </p>
      `,
    });

    if (error) {
      console.error(`❌ Resend error:`, error);
      return NextResponse.json(
        {
          success: false,
          message: "Test email gagal dikirim via Resend",
          error: {
            message: error.message,
            tips: getErrorTips(error),
          },
        },
        { status: 400 },
      );
    }

    console.log(`✅ Test email sent — id: ${data?.id}\n`);

    return NextResponse.json(
      {
        success: true,
        message: "Test email berhasil dikirim via Resend!",
        mode: "resend",
        info: {
          email: testEmail,
          emailId: data?.id,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ TEST EMAIL FAILED: ${msg}`);

    return NextResponse.json(
      {
        success: false,
        message: "Email test gagal",
        error: { message: msg },
      },
      { status: 400 },
    );
  }
}

function getErrorTips(error: { message?: string; name?: string }): string[] {
  const tips = [
    "Pastikan RESEND_API_KEY sudah diisi di .env",
    "Pastikan domain pengirim sudah diverifikasi di dashboard Resend",
    "Gunakan format 'Name <email@domain.com>' untuk RESEND_FROM_EMAIL",
  ];

  if (error.name === "validation_error") {
    tips.push("Cek format email penerima sudah benar");
  }

  return tips;
}
