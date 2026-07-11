import { AppError, pesanAman } from "@/server/utils/appError";
/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: "📋 Daftar user (staff/admin)"
 *     description: |
 *       Mengambil daftar user secara pagination. Untuk staff & admin.
 *       Staff hanya melihat akun ber-role warga (filter `role` diabaikan & dipaksa `user`);
 *       admin bebas melihat semua role dan boleh memakai parameter `role`.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Nomor halaman (opsional, default 1)
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         description: Jumlah data per halaman (opsional, default 10, maksimal 100)
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *       - in: query
 *         name: q
 *         description: Kata kunci pencarian (cocok dengan nama, email, atau NIK)
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         description: "Filter role (hanya berlaku untuk admin — staff selalu dipaksa `user`)"
 *         schema:
 *           type: string
 *           enum: [user, staff, admin]
 *     responses:
 *       200:
 *         description: Daftar user dengan pagination
 *       401:
 *         description: Unauthorized — token tidak ada atau tidak valid
 *       403:
 *         description: Forbidden — hanya staff/admin yang boleh mengakses
 *   post:
 *     tags:
 *       - Users
 *     summary: "➕ Tambah user baru (staff/admin)"
 *     description: |
 *       Staff/admin menambah user baru. Staff hanya bisa membuat akun ber-role
 *       warga (field `role` di body diabaikan & dipaksa `user`); admin bebas
 *       memilih role.
 *       **Field wajib**: name, email, nik, password.
 *       **Field opsional**: semua field lainnya. Jika tidak diisi, nilainya null.
 *       Role default adalah `user` jika tidak diisi.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, nik, password]
 *             properties:
 *               name:
 *                 type: string
 *                 description: "**WAJIB** — Nama lengkap user, minimal 3 karakter"
 *                 minLength: 3
 *                 example: "Budi Santoso"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "**WAJIB** — Alamat email unik, digunakan untuk login"
 *                 example: "budi@example.com"
 *               nik:
 *                 type: string
 *                 description: "**WAJIB** — Nomor Induk Kependudukan, tepat 16 digit angka, unik"
 *                 minLength: 16
 *                 maxLength: 16
 *                 pattern: "^\\d{16}$"
 *                 example: "1234567890123456"
 *               password:
 *                 type: string
 *                 description: "**WAJIB** — Password user, minimal 8 karakter. Akan di-hash sebelum disimpan"
 *                 minLength: 8
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [user, staff, admin]
 *                 description: "Opsional — Role akses user. Default: `user`"
 *                 default: user
 *                 example: "staff"
 *               positionId:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — ID jabatan dari tabel positions. Kosongkan jika tidak ada jabatan"
 *                 example: "clx1abc2def3ghi4"
 *               religion:
 *                 type: string
 *                 enum: [islam, kristen, katolik, hindu, buddha, konghucu]
 *                 nullable: true
 *                 description: "Opsional — Agama user"
 *                 example: "islam"
 *               address:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Alamat tempat tinggal"
 *                 example: "Jl. Merdeka No. 1, Sangkima"
 *               birthday:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Tanggal lahir, format YYYY-MM-DD"
 *                 pattern: "^\\d{4}-\\d{2}-\\d{2}$"
 *                 example: "1990-01-15"
 *               placeOfBirth:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Tempat lahir"
 *                 example: "Sangkima"
 *               job:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Pekerjaan user"
 *                 example: "Petani"
 *               gender:
 *                 type: string
 *                 enum: [L, P]
 *                 nullable: true
 *                 description: "Opsional — Jenis kelamin. `L` = Laki-laki, `P` = Perempuan"
 *                 example: "L"
 *               telp:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Nomor telepon"
 *                 example: "081234567890"
 *               citizenship:
 *                 type: string
 *                 enum: [wni, wna]
 *                 nullable: true
 *                 description: "Opsional — Kewarganegaraan. `wni` = Warga Negara Indonesia, `wna` = Warga Negara Asing"
 *                 example: "wni"
 *               status:
 *                 type: string
 *                 enum: ["Belum Menikah", "Menikah", "Cerai Hidup", "Cerai Mati"]
 *                 nullable: true
 *                 description: "Opsional — Status pernikahan"
 *                 example: "Belum Menikah"
 *               education:
 *                 type: string
 *                 enum: ["SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "D1", "D2", "D3", "S1/Setara D4", "S2", "S3"]
 *                 nullable: true
 *                 description: "Opsional — Pendidikan terakhir"
 *                 example: "S1/Setara D4"
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       400:
 *         description: Validasi gagal, email sudah digunakan, atau NIK sudah digunakan
 *       401:
 *         description: Unauthorized — token tidak ada atau tidak valid
 *       403:
 *         description: Forbidden — hanya staff/admin yang boleh menambah user
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user.service";
import {
  requireRole,
  handleACLError,
  isACLError,
} from "@/server/middlewares/acl.middleware";

const ROLES = ["user", "staff", "admin"] as const;

export async function GET(req: Request) {
  try {
    // staff juga boleh membaca daftar untuk mencari pemohon saat input pengajuan manual
    // (bisa mencari semua user termasuk staff sendiri)
    const auth = await requireRole(req, ["staff", "admin"]);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));
    const q = searchParams.get("q") ?? undefined;
    const roleParam = searchParams.get("role");
    const role =
      roleParam && ROLES.includes(roleParam as (typeof ROLES)[number])
        ? (roleParam as (typeof ROLES)[number])
        : undefined;

    const result = await userService.list(page, limit, q, role);

    return NextResponse.json(
      { success: true, message: "Daftar user berhasil diambil", ...result },
      { status: 200 },
    );
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    return NextResponse.json(
      { success: false, message: pesanAman(error, "Terjadi kesalahan internal server") },
      { status: 500 },
    );
  }
}

import { saveProfileImage } from "@/server/utils/imageUpload";

async function parseUserBody(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return await req.json();
  }

  const fd = await req.formData();
  const body: Record<string, any> = {};
  for (const [key, entry] of fd.entries()) {
    if (key === "signatureImage" && entry instanceof File && entry.size > 0) {
      const buffer = Buffer.from(await entry.arrayBuffer());
      const url = await saveProfileImage(
        { mime: entry.type, size: entry.size, buffer },
        { variant: "graphic" }
      );
      body.signatureUrl = url;
    } else if (typeof entry === "string") {
      if (entry === "null" || entry === "") {
        body[key] = null;
      } else {
        body[key] = entry;
      }
    }
  }
  return body;
}

export async function POST(req: Request) {
  try {
    const auth = await requireRole(req, ["staff", "admin"]);

    const body = await parseUserBody(req);
    // staff hanya boleh menambah akun warga, walaupun body memuat role lain
    if (auth.role === "staff") body.role = "user";
    const data = await userService.createByAdmin(body);

    return NextResponse.json(
      { success: true, message: "User berhasil dibuat", data },
      { status: 201 },
    );
  } catch (error) {
    if (isACLError(error)) return handleACLError(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: pesanAman(error, "Terjadi kesalahan internal server") },
      { status: 400 },
    );
  }
}
