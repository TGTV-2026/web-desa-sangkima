/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: "👤 Detail user"
 *     description: Mengambil detail satu user berdasarkan ID. Hanya untuk admin.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unik user (CUID2)
 *         schema:
 *           type: string
 *           example: "clx1abc2def3ghi4"
 *     responses:
 *       200:
 *         description: Detail user berhasil diambil
 *       401:
 *         description: Unauthorized — token tidak ada atau tidak valid
 *       403:
 *         description: Forbidden — hanya admin yang boleh mengakses
 *       404:
 *         description: User tidak ditemukan atau sudah dihapus
 *   put:
 *     tags:
 *       - Users
 *     summary: "✏️ Edit user (admin)"
 *     description: |
 *       Mengubah data user. **Semua field opsional** — kirim hanya field yang ingin diubah.
 *       Minimal satu field harus diisi. Untuk menghapus nilai field nullable, kirim `null`.
 *       Jika `password` diisi, akan di-hash ulang sebelum disimpan.
 *       Jika `email` atau `nik` diubah, sistem akan mengecek keunikannya.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unik user (CUID2)
 *         schema:
 *           type: string
 *           example: "clx1abc2def3ghi4"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: "Opsional — Nama lengkap, minimal 3 karakter"
 *                 example: "Budi Santoso"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: "Opsional — Email baru, harus unik. Dicek keunikannya"
 *                 example: "budi.baru@example.com"
 *               nik:
 *                 type: string
 *                 minLength: 16
 *                 maxLength: 16
 *                 pattern: "^\\d{16}$"
 *                 description: "Opsional — NIK baru, tepat 16 digit angka, harus unik"
 *                 example: "1234567890123456"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: "Opsional — Password baru, minimal 8 karakter. Akan di-hash ulang"
 *                 example: "newpassword123"
 *               role:
 *                 type: string
 *                 enum: [user, staff, admin]
 *                 description: "Opsional — Ubah role akses user"
 *                 example: "staff"
 *               positionId:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — ID jabatan baru. Kirim `null` untuk menghapus jabatan"
 *                 example: "clx1abc2def3ghi4"
 *               religion:
 *                 type: string
 *                 enum: [islam, kristen, katolik, hindu, buddha, konghucu]
 *                 nullable: true
 *                 description: "Opsional — Agama. Kirim `null` untuk mengosongkan"
 *                 example: "islam"
 *               address:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Alamat tempat tinggal. Kirim `null` untuk mengosongkan"
 *                 example: "Jl. Merdeka No. 1, Sangkima"
 *               birthday:
 *                 type: string
 *                 nullable: true
 *                 pattern: "^\\d{4}-\\d{2}-\\d{2}$"
 *                 description: "Opsional — Tanggal lahir format YYYY-MM-DD. Kirim `null` untuk mengosongkan"
 *                 example: "1990-01-15"
 *               placeOfBirth:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Tempat lahir. Kirim `null` untuk mengosongkan"
 *                 example: "Sangkima"
 *               job:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Pekerjaan. Kirim `null` untuk mengosongkan"
 *                 example: "Petani"
 *               gender:
 *                 type: string
 *                 enum: [L, P]
 *                 nullable: true
 *                 description: "Opsional — Jenis kelamin: `L` = Laki-laki, `P` = Perempuan. Kirim `null` untuk mengosongkan"
 *                 example: "L"
 *               telp:
 *                 type: string
 *                 nullable: true
 *                 description: "Opsional — Nomor telepon. Kirim `null` untuk mengosongkan"
 *                 example: "081234567890"
 *               citizenship:
 *                 type: string
 *                 enum: [wni, wna]
 *                 nullable: true
 *                 description: "Opsional — Kewarganegaraan: `wni` = WNI, `wna` = WNA. Kirim `null` untuk mengosongkan"
 *                 example: "wni"
 *               status:
 *                 type: string
 *                 enum: ["Belum Menikah", "Menikah", "Cerai Hidup", "Cerai Mati"]
 *                 nullable: true
 *                 description: "Opsional — Status pernikahan. Kirim `null` untuk mengosongkan"
 *                 example: "Menikah"
 *               education:
 *                 type: string
 *                 enum: ["SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat", "D1", "D2", "D3", "S1/Setara D4", "S2", "S3"]
 *                 nullable: true
 *                 description: "Opsional — Pendidikan terakhir. Kirim `null` untuk mengosongkan"
 *                 example: "S1/Setara D4"
 *     responses:
 *       200:
 *         description: User berhasil diperbarui
 *       400:
 *         description: Validasi gagal, email sudah digunakan, atau NIK sudah digunakan
 *       401:
 *         description: Unauthorized — token tidak ada atau tidak valid
 *       403:
 *         description: Forbidden — hanya admin yang boleh mengedit user
 *       404:
 *         description: User tidak ditemukan atau sudah dihapus
 *   delete:
 *     tags:
 *       - Users
 *     summary: "🗑️ Hapus user — soft delete (admin)"
 *     description: |
 *       Menghapus user secara soft delete dengan mengisi kolom `deletedAt`.
 *       Data user tetap ada di database namun tidak bisa login dan tidak muncul di daftar.
 *       **Tidak bisa digunakan untuk menghapus akun sendiri** (akan dikembalikan 403).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID unik user yang akan dihapus (CUID2)
 *         schema:
 *           type: string
 *           example: "clx1abc2def3ghi4"
 *     responses:
 *       200:
 *         description: User berhasil dihapus (soft delete)
 *       401:
 *         description: Unauthorized — token tidak ada atau tidak valid
 *       403:
 *         description: Forbidden — hanya admin, atau mencoba menghapus akun sendiri
 *       404:
 *         description: User tidak ditemukan atau sudah dihapus sebelumnya
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user.service";
import {
  requireRole,
  handleACLError,
} from "@/server/middlewares/acl.middleware";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    const data = await userService.getById(id);

    return NextResponse.json(
      { success: true, message: "Detail user berhasil diambil", data },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    return NextResponse.json(
      { success: false, message: error.message || "User tidak ditemukan" },
      { status: 404 },
    );
  }
}

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    await requireRole(req, ["admin"]);

    const { id } = await params;
    const body = await req.json();
    const data = await userService.update(id, body);

    return NextResponse.json(
      { success: true, message: "User berhasil diperbarui", data },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const isNotFound = error.message?.includes("tidak ditemukan");
    return NextResponse.json(
      { success: false, message: error.message || "Terjadi kesalahan internal server" },
      { status: isNotFound ? 404 : 400 },
    );
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const auth = await requireRole(req, ["admin"]);

    const { id } = await params;

    if (auth.id === id) {
      return NextResponse.json(
        { success: false, message: "Tidak dapat menghapus akun sendiri" },
        { status: 403 },
      );
    }

    await userService.softDelete(id);

    return NextResponse.json(
      { success: true, message: "User berhasil dihapus" },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === "ACLError") return handleACLError(error);
    return NextResponse.json(
      { success: false, message: error.message || "User tidak ditemukan" },
      { status: 404 },
    );
  }
}
