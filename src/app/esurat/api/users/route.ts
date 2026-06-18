/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: "📋 Daftar user (admin)"
 *     description: Mengambil daftar user secara pagination. Hanya untuk admin.
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
 *     responses:
 *       200:
 *         description: Daftar user dengan pagination
 *       401:
 *         description: Unauthorized — token tidak ada atau tidak valid
 *       403:
 *         description: Forbidden — hanya admin yang boleh mengakses
 *   post:
 *     tags:
 *       - Users
 *     summary: "➕ Tambah user baru (admin)"
 *     description: |
 *       Admin menambah user baru beserta role dan jabatan.
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
 *         description: Forbidden — hanya admin yang boleh menambah user
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

export async function GET(req: Request) {
  try {
    await requireRole(req, ["admin"]);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "10")));

    const result = await userService.list(page, limit);

    return NextResponse.json(
      { success: true, message: "Daftar user berhasil diambil", ...result },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    return NextResponse.json(
      { success: false, message: error.message || "Terjadi kesalahan internal server" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(req, ["admin"]);

    const body = await req.json();
    const data = await userService.createByAdmin(body);

    return NextResponse.json(
      { success: true, message: "User berhasil dibuat", data },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || "Terjadi kesalahan internal server" },
      { status: 400 },
    );
  }
}
