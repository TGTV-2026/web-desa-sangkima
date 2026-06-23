import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { letterTypeRepository } from "../repositories/letterType.repository";
import {
  letterRequestRepository,
  type LetterRequestJoinedRow,
} from "../repositories/letterRequest.repository";
import { userRepository } from "../repositories/user.repository";
import type { AuthUser } from "../middlewares/role.middleware";
import { isProfileComplete, getMissingProfileFields } from "../types/user";
import {
  createLetterRequestSchema,
  rejectLetterRequestSchema,
  processLetterRequestSchema,
  approveLetterRequestSchema,
  updateLetterRequestDataSchema,
  buildLetterDataSchema,
  normalizeRequiredFields,
  parseJsonColumn,
  SUPPORTING_DOCS,
  type LetterAttachment,
  type LetterLogDTO,
  type LetterRequestDTO,
  type LetterRequestData,
  type LetterStatus,
  type LetterVerificationDTO,
} from "../types/letter";
import type { PaginationMeta } from "../types/pagination";
import { formatLetterNumber } from "../utils/letter-number";
import { generateLetterPdf, savePdf, readPdf } from "./pdf.service";

function toDTO(row: LetterRequestJoinedRow): LetterRequestDTO {
  const r = row.request;
  return {
    id: r.id,
    status: r.status as LetterStatus,
    purpose: r.purpose,
    data: parseJsonColumn<LetterRequestData | null>(r.data, null),
    attachments: parseJsonColumn<LetterAttachment[]>(r.attachments, []).map((a) => ({
      name: a.name,
      mime: a.mime,
      size: a.size,
      docIndex: a.docIndex,
    })),
    letterNumber: r.letterNumber ?? null,
    rejectionReason: r.rejectionReason ?? null,
    verificationCode: r.verificationCode ?? null,
    requester: { id: r.userId, name: row.requesterName, nik: row.requesterNik },
    letterType: {
      id: r.letterTypeId,
      code: row.typeCode,
      name: row.typeName,
      requiredFields: normalizeRequiredFields(row.typeRequiredFields),
    },
    createdAt: (r.createdAt ?? new Date()).toISOString(),
    approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
  };
}

function requireStaffOrAdmin(actor: AuthUser) {
  if (actor.role !== "staff" && actor.role !== "admin") {
    throw new Error("Hanya petugas desa yang boleh melakukan aksi ini");
  }
}

// Validasi + bersihkan `data` sesuai requiredFields jenis surat (required, enum
// pilihan, & coerce angka). Lempar ZodError → route mengubahnya jadi 400 fieldErrors.
function parseLetterData(
  requiredFields: unknown,
  data: LetterRequestData | undefined,
): LetterRequestData {
  const fields = normalizeRequiredFields(requiredFields);
  const parsed = buildLetterDataSchema(fields).parse(data ?? {});
  // buang field opsional yang kosong (Zod menyisakannya sebagai undefined)
  return Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== undefined),
  ) as LetterRequestData;
}

// Ambil baris mentah + pastikan ada
async function getRowOrThrow(id: string) {
  const row = await letterRequestRepository.findById(id);
  if (!row) throw new Error("Pengajuan surat tidak ditemukan");
  return row;
}

// Render PDF dari data SAAT INI (dipanggil sekali saat approve, lalu hasilnya
// disimpan ke disk lewat pdfPath supaya tidak ikut berubah kalau profil
// warga diedit belakangan).
async function renderPdf(
  row: LetterRequestJoinedRow,
  appUrl: string,
  draft = false,
): Promise<Uint8Array> {
  const user = await userRepository.findById(row.request.userId);
  const type = await letterTypeRepository.findById(row.request.letterTypeId);

  return generateLetterPdf({
    letterNumber: row.request.letterNumber ?? "-",
    verificationCode: row.request.verificationCode ?? "",
    approvedAt: row.request.approvedAt ?? new Date(),
    template: type?.template ?? null,
    letterTypeName: row.typeName,
    requester: {
      name: row.requesterName,
      nik: row.requesterNik,
      address: user?.address ?? null,
      placeOfBirth: user?.placeOfBirth ?? null,
      birthday: user?.birthday ?? null,
      job: user?.job ?? null,
    },
    purpose: row.request.purpose,
    data: parseJsonColumn<LetterRequestData | null>(row.request.data, null),
    appUrl,
    draft,
  });
}

export const letterRequestService = {
  // Warga mengajukan surat (lampiran sudah divalidasi & disimpan oleh route)
  async create(
    actor: AuthUser,
    input: unknown,
    attachments: LetterAttachment[] = [],
    requestId: string,
  ): Promise<LetterRequestDTO> {
    const data = createLetterRequestSchema.parse(input);

    // staff/admin boleh mengajukan atas nama warga lain (mis. warga datang langsung ke kantor desa)
    let requesterId = actor.id;
    if (actor.role !== "user" && data.userId) {
      const requester = await userRepository.findById(data.userId);
      if (!requester || requester.deletedAt) {
        throw new Error("Pengguna pemohon tidak ditemukan");
      }
      if (!isProfileComplete(requester)) {
        throw new Error(
          `Data profil pemohon belum lengkap: ${getMissingProfileFields(requester).join(", ")}. Lengkapi dulu lewat menu Kelola Pengguna.`,
        );
      }
      requesterId = data.userId;
    }

    const type = await letterTypeRepository.findById(data.letterTypeId);
    if (!type) throw new Error("Jenis surat tidak ditemukan");
    if (!type.active) throw new Error("Jenis surat sedang tidak aktif");

    // tidak boleh ada 2 pengajuan jenis surat sama yang masih berjalan (DIAJUKAN/DIPROSES) sekaligus
    if (await letterRequestRepository.hasPending(requesterId, data.letterTypeId)) {
      throw new Error(
        `Masih ada pengajuan ${type.name} yang belum disetujui. Tunggu sampai disetujui sebelum mengajukan lagi.`,
      );
    }

    const cleanData = parseLetterData(type.requiredFields, data.data);

    // pastikan tiap dokumen pendukung wajib sudah terunggah (pengaman; client juga memblok)
    const docs = SUPPORTING_DOCS[type.code] ?? [];
    const uploadedDocIndexes = new Set(attachments.map((a) => a.docIndex));
    docs.forEach((doc, i) => {
      if (doc.required && !uploadedDocIndexes.has(i)) {
        throw new Error(`Dokumen wajib "${doc.label}" belum diunggah`);
      }
    });

    const id = await letterRequestRepository.create({
      id: requestId,
      userId: requesterId,
      letterTypeId: data.letterTypeId,
      purpose: data.purpose,
      data: Object.keys(cleanData).length > 0 ? cleanData : null,
      attachments: attachments.length > 0 ? attachments : null,
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DIAJUKAN",
      note: null,
      changedBy: actor.id,
    });

    return toDTO(await getRowOrThrow(id));
  },

  async listForUser(
    userId: string,
    status?: LetterStatus,
  ): Promise<LetterRequestDTO[]> {
    const rows = await letterRequestRepository.findByUser(userId, status);
    return rows.map(toDTO);
  },

  // Jenis surat yang masih punya pengajuan berjalan milik warga ini — dipakai modal pilih jenis surat
  async getPendingTypeIds(userId: string): Promise<string[]> {
    return letterRequestRepository.findPendingTypeIds(userId);
  },

  async listAll(status?: LetterStatus): Promise<LetterRequestDTO[]> {
    const rows = await letterRequestRepository.findAll(status);
    return rows.map(toDTO);
  },

  async listAllPaginated(
    status: LetterStatus | undefined,
    page: number,
    limit: number,
  ): Promise<{ data: LetterRequestDTO[]; pagination: PaginationMeta }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const { rows, total } = await letterRequestRepository.findAllPaginated(
      status,
      safePage,
      safeLimit,
    );
    return {
      data: rows.map(toDTO),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  // Detail; warga hanya boleh melihat miliknya sendiri
  async getForActor(id: string, actor: AuthUser): Promise<LetterRequestDTO> {
    const row = await getRowOrThrow(id);
    if (actor.role === "user" && row.request.userId !== actor.id) {
      throw new Error("Anda tidak berhak melihat pengajuan ini");
    }
    return toDTO(row);
  },

  // Timeline riwayat status — dipanggil setelah getForActor() di halaman detail
  // (kepemilikan sudah tervalidasi di sana, tidak diulang di sini)
  async getLogs(id: string): Promise<LetterLogDTO[]> {
    const logs = await letterRequestRepository.findLogs(id);
    return logs.map((l) => ({
      id: l.id,
      status: l.status as LetterStatus,
      note: l.note ?? null,
      changedByName: l.changedByName ?? null,
      createdAt: (l.createdAt ?? new Date()).toISOString(),
    }));
  },

  // Operator menerima & memproses: DIAJUKAN -> DIPROSES
  async process(
    actor: AuthUser,
    id: string,
    input: unknown,
  ): Promise<LetterRequestDTO> {
    requireStaffOrAdmin(actor);
    const { note } = processLetterRequestSchema.parse(input ?? {});
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DIAJUKAN") {
      throw new Error("Surat hanya bisa diproses dari status Diajukan");
    }
    await letterRequestRepository.update(id, {
      status: "DIPROSES",
      verifiedBy: actor.id,
      verifiedAt: new Date(),
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DIPROSES",
      note: note ?? null,
      changedBy: actor.id,
    });
    return toDTO(await getRowOrThrow(id));
  },

  // Kepala desa menyetujui: DIPROSES -> DISETUJUI (nomor surat & kode verifikasi dibuat)
  async approve(
    actor: AuthUser,
    id: string,
    input: unknown,
    appUrl: string,
  ): Promise<LetterRequestDTO> {
    if (actor.role !== "admin") {
      throw new Error("Hanya kepala desa (admin) yang boleh menyetujui surat");
    }
    const { note } = approveLetterRequestSchema.parse(input ?? {});
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DIPROSES") {
      throw new Error("Surat harus berstatus Diproses sebelum disetujui");
    }

    const now = new Date();
    // nomor urut = surat disetujui tahun ini + 1; kolom letter_number UNIQUE,
    // jadi kalau dua approve berbarengan menghasilkan nomor sama, yang kalah
    // akan kena error duplikat -> coba lagi dengan nomor berikutnya
    const baseSequence =
      (await letterRequestRepository.countApprovedInYear(now.getFullYear())) + 1;

    for (let attempt = 0; ; attempt++) {
      try {
        await letterRequestRepository.update(id, {
          status: "DISETUJUI",
          approvedBy: actor.id,
          approvedAt: now,
          letterNumber: formatLetterNumber(baseSequence + attempt, now),
          verificationCode: createId(),
        });
        break;
      } catch (e: any) {
        const msg = String(e?.cause?.message ?? e?.message ?? "");
        if (msg.includes("Duplicate entry") && attempt < 5) continue;
        throw e;
      }
    }
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DISETUJUI",
      note: note ?? null,
      changedBy: actor.id,
    });

    // terbitkan PDF sekali saat ini juga, supaya isinya jadi snapshot tetap
    const approvedRow = await getRowOrThrow(id);
    const pdf = await renderPdf(approvedRow, appUrl);
    const pdfPath = await savePdf(id, pdf);
    await letterRequestRepository.update(id, { pdfPath });

    return toDTO(await getRowOrThrow(id));
  },

  // Tolak: DIAJUKAN/DIPROSES -> DITOLAK (wajib alasan)
  async reject(
    actor: AuthUser,
    id: string,
    input: unknown,
  ): Promise<LetterRequestDTO> {
    requireStaffOrAdmin(actor);
    const { reason } = rejectLetterRequestSchema.parse(input);
    const row = await getRowOrThrow(id);
    if (
      row.request.status !== "DIAJUKAN" &&
      row.request.status !== "DIPROSES"
    ) {
      throw new Error("Hanya surat Diajukan/Diproses yang bisa ditolak");
    }
    await letterRequestRepository.update(id, {
      status: "DITOLAK",
      rejectionReason: reason,
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DITOLAK",
      note: reason,
      changedBy: actor.id,
    });
    return toDTO(await getRowOrThrow(id));
  },

  // Tandai selesai (sudah diambil/diunduh warga): DISETUJUI -> SELESAI
  async complete(actor: AuthUser, id: string): Promise<LetterRequestDTO> {
    requireStaffOrAdmin(actor);
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DISETUJUI") {
      throw new Error("Hanya surat Disetujui yang bisa ditandai selesai");
    }
    await letterRequestRepository.update(id, {
      status: "SELESAI",
      completedAt: new Date(),
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "SELESAI",
      note: null,
      changedBy: actor.id,
    });
    return toDTO(await getRowOrThrow(id));
  },

  // Verifikasi publik via kode QR (tanpa auth, tanpa data sensitif)
  async verifyByCode(code: string): Promise<LetterVerificationDTO> {
    const row = await letterRequestRepository.findByVerificationCode(code);
    if (!row || row.request.status === "DITOLAK") {
      return {
        valid: false,
        letterNumber: null,
        letterTypeName: null,
        requesterName: null,
        approvedAt: null,
      };
    }
    return {
      valid: true,
      letterNumber: row.request.letterNumber ?? null,
      letterTypeName: row.typeName,
      requesterName: row.requesterName,
      approvedAt: row.request.approvedAt
        ? row.request.approvedAt.toISOString()
        : null,
    };
  },

  // Generate PDF surat (hanya yang sudah DISETUJUI/SELESAI)
  async generatePdf(
    id: string,
    actor: AuthUser,
    appUrl: string,
  ): Promise<Uint8Array> {
    const row = await getRowOrThrow(id);
    if (actor.role === "user" && row.request.userId !== actor.id) {
      throw new Error("Anda tidak berhak mengunduh surat ini");
    }
    if (
      row.request.status !== "DISETUJUI" &&
      row.request.status !== "SELESAI"
    ) {
      throw new Error("Surat belum disetujui, PDF belum bisa dibuat");
    }

    // surat normalnya sudah punya PDF tersimpan sejak di-approve (snapshot data
    // saat itu); fallback render+simpan di sini hanya untuk surat lama sebelum fitur ini ada
    if (row.request.pdfPath) {
      const stored = await readPdf(id);
      if (stored) return stored;
    }
    const pdf = await renderPdf(row, appUrl);
    await letterRequestRepository.update(id, { pdfPath: await savePdf(id, pdf) });
    return pdf;
  },

  // Pratinjau hasil surat (semua status); kalau sudah resmi terbit, pakai snapshot
  // PDF yang sama dengan unduhan biasa, kalau belum maka dirender langsung sebagai draft
  // (tanpa nomor/QR resmi, ditandai watermark) tanpa disimpan ke disk.
  async previewPdf(id: string, actor: AuthUser, appUrl: string): Promise<Uint8Array> {
    const row = await getRowOrThrow(id);
    if (actor.role === "user" && row.request.userId !== actor.id) {
      throw new Error("Anda tidak berhak melihat pratinjau surat ini");
    }
    if (row.request.status === "DISETUJUI" || row.request.status === "SELESAI") {
      return this.generatePdf(id, actor, appUrl);
    }
    return renderPdf(row, appUrl, true);
  },

  // Petugas merapikan field dinamis warga (mis. salah ketik) sebelum surat diproses
  async updateData(actor: AuthUser, id: string, input: unknown): Promise<LetterRequestDTO> {
    requireStaffOrAdmin(actor);
    const { purpose, data } = updateLetterRequestDataSchema.parse(input);
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DIAJUKAN") {
      throw new Error("Data hanya bisa diedit sebelum surat diproses");
    }
    const type = await letterTypeRepository.findById(row.request.letterTypeId);
    const cleanData = parseLetterData(type?.requiredFields, data);

    await letterRequestRepository.update(id, { purpose, data: cleanData });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DIAJUKAN",
      note: "Data pemohon diperbarui oleh petugas",
      changedBy: actor.id,
    });
    return toDTO(await getRowOrThrow(id));
  },

  // Dispatcher aksi petugas dari satu endpoint PATCH
  async changeStatus(
    actor: AuthUser,
    id: string,
    input: unknown,
    appUrl: string,
  ): Promise<LetterRequestDTO> {
    const { action } = z
      .object({
        action: z.enum(["process", "approve", "reject", "complete", "updateData"]),
      })
      .parse(input);

    switch (action) {
      case "process":
        return this.process(actor, id, input);
      case "approve":
        return this.approve(actor, id, input, appUrl);
      case "reject":
        return this.reject(actor, id, input);
      case "complete":
        return this.complete(actor, id);
      case "updateData":
        return this.updateData(actor, id, input);
    }
  },
};
