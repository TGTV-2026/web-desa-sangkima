/**
 * @swagger
 * /api/auth/test-email:
 *   post:
 *     tags:
 *       - Utilities
 *     summary: "🧪 Test email configuration (admin)"
 *     description: Test email configuration by sending a test email. Development/debugging purpose only. Admin only.
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
 *         description: Missing testEmail parameter
 */

import { NextResponse } from "next/server";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

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

    // Development mode
    if (process.env.NODE_ENV !== "production") {
      console.log("\n🧪 TEST EMAIL (Development Mode)");
      console.log(`   To: ${testEmail}`);
      console.log(`   NODE_ENV: development`);
      console.log(
        `   Status: Akan ditampilkan di console, tidak ada email real\n`,
      );

      return NextResponse.json(
        {
          success: true,
          message: "Development mode - check console untuk OTP",
          mode: "development",
          info: {
            email: testEmail,
            note: "Email ditampilkan di console, bukan dikirim real",
          },
        },
        { status: 200 },
      );
    }

    // Production mode - test SMTP connection
    console.log("\n🧪 Testing SMTP Configuration...");
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   From: ${process.env.SMTP_FROM_EMAIL}`);

    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    console.log(`   Verifying connection...`);
    await transporter.verify();
    console.log(`   ✅ SMTP connection verified\n`);

    // Send test email
    console.log(`   Sending test email to ${testEmail}...`);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: testEmail,
      subject: "Test Email - Desa Sangkima OTP System",
      html: `
        <h2>Test Email</h2>
        <p>Jika Anda menerima email ini, berarti SMTP configuration benar! ✅</p>
        <p>
          <strong>Info:</strong><br>
          From: ${process.env.SMTP_FROM_EMAIL}<br>
          Time: ${new Date().toLocaleString()}
        </p>
      `,
    });

    console.log(`✅ Test email sent successfully`);
    console.log(`   Message ID: ${info.messageId}\n`);

    return NextResponse.json(
      {
        success: true,
        message: "Test email berhasil dikirim!",
        mode: "production",
        info: {
          email: testEmail,
          messageId: info.messageId,
          smtpHost: process.env.SMTP_HOST,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(`\n❌ SMTP TEST FAILED`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}\n`);

    // Determine error type
    let errorType = "unknown";
    if (error.code === "ECONNREFUSED") {
      errorType = "Connection refused - cek SMTP_HOST & SMTP_PORT";
    } else if (error.code === "EAUTH") {
      errorType = "Authentication failed - cek SMTP_USER & SMTP_PASSWORD";
    } else if (error.code === "ETIMEDOUT") {
      errorType = "Connection timeout - cek firewall & internet";
    }

    return NextResponse.json(
      {
        success: false,
        message: "Email test gagal",
        error: {
          type: errorType,
          message: error.message,
          code: error.code,
          tips: getErrorTips(error.code),
        },
      },
      { status: 400 },
    );
  }
}

function getErrorTips(code?: string): string[] {
  const tips = [
    "Pastikan .env variables sudah benar (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)",
    "Jika Gmail: gunakan App Password (bukan Google password biasa)",
    "Cek firewall - port 587 atau 465 harus bisa diakses",
    "Cek internet connection",
  ];

  if (code === "ECONNREFUSED") {
    tips.push("SMTP server unreachable - cek host & port");
  } else if (code === "EAUTH") {
    tips.push("Re-generate credentials jika belum diperbaharui");
  } else if (code === "ETIMEDOUT") {
    tips.push("Coba ganti port (587 → 465 atau sebaliknya)");
  }

  return tips;
}
