import { AppError } from "../utils/appError";
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
  getSupportingDocs,
  type LetterAttachment,
  type LetterLogDTO,
  type LetterRequestDTO,
  type LetterRequestData,
  type LetterStatus,
  type LetterVerificationDTO,
} from "../types/letter";
import type { PaginationMeta } from "../types/pagination";
import { formatLetterNumber } from "../utils/letter-number";
import { docxTemplateService } from "./docxTemplate.service";
import {
  generateLetterPdf,
  savePdf,
  readPdf,
  type LetterPdfInput,
} from "./pdf.service";

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
      supportingDocs: getSupportingDocs(row.typeCode, row.typeSupportingDocs),
      requireManualNumber: row.typeRequireManualNumber,
    },
    createdAt: (r.createdAt ?? new Date()).toISOString(),
    approvedAt: r.approvedAt ? r.approvedAt.toISOString() : null,
  };
}

// Kategori jabatan yang boleh memverifikasi/memproses surat (DIAJUKAN → DIPROSES)
const VERIFIER_CATEGORIES = ["Kepala Urusan"];
// Kategori jabatan yang boleh menyetujui dan menandatangani (DIPROSES → DISETUJUI)
const APPROVER_CATEGORIES = ["Kepala Desa", "Sekretaris Desa"];

function requireStaff(actor: AuthUser) {
  if (actor.role !== "staff" && actor.role !== "admin") {
    throw new AppError("Hanya petugas desa yang boleh melakukan aksi ini");
  }
}

/**
 * Pastikan aktor punya jabatan yang termasuk dalam kategori yang diizinkan.
 * Admin TIDAK otomatis lolos — otorisasi approval murni berdasarkan jabatan.
 */
function requirePosition(actor: AuthUser, categories: string[], actionLabel: string) {
  if (actor.role !== "staff") {
    throw new AppError(`Hanya petugas dengan jabatan ${categories.join(" / ")} yang boleh ${actionLabel}`);
  }
  if (!actor.positionCategory || !categories.includes(actor.positionCategory)) {
    throw new AppError(`Hanya jabatan ${categories.join(" / ")} yang boleh ${actionLabel}`);
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
  if (!row) throw new AppError("Pengajuan surat tidak ditemukan");
  return row;
}

// Render PDF dari data SAAT INI (dipanggil sekali saat approve, lalu hasilnya
// disimpan ke disk lewat pdfPath supaya tidak ikut berubah kalau profil
// warga diedit belakangan).
async function renderPdf(
  row: LetterRequestJoinedRow,
  appUrl: string,
  draft = false,
  noSignature = false
): Promise<Uint8Array> {
  const user = await userRepository.findById(row.request.userId);
  const type = await letterTypeRepository.findById(row.request.letterTypeId);

  let signatory = null;
  if (row.request.approvedBy) {
    const approver = await userRepository.findByIdWithPosition(row.request.approvedBy);
    if (approver && approver.user) {
      signatory = {
        name: approver.user.name,
        positionCategory: approver.positionCategory ?? "Kepala Desa",
        signatureUrl: approver.user.signatureUrl ?? null,
      };
    }
  }

  const input: LetterPdfInput = {
    letterNumber: row.request.letterNumber ?? "-",
    verificationCode: row.request.verificationCode ?? "",
    approvedAt: row.request.approvedAt ?? row.request.verifiedAt ?? new Date(),
    template: type?.template ?? null,
    letterTypeName: row.typeName,
    requester: {
      name: row.requesterName,
      nik: row.requesterNik,
      address: user?.address ?? null,
      placeOfBirth: user?.placeOfBirth ?? null,
      birthday: user?.birthday ?? null,
      job: user?.job ?? null,
      religion: user?.religion ?? null,
      gender: user?.gender ?? null,
      citizenship: user?.citizenship ?? null,
      status: user?.status ?? null,
      education: user?.education ?? null,
    },
    purpose: row.request.purpose,
    data: parseJsonColumn<LetterRequestData | null>(row.request.data, null),
    appUrl,
    draft,
    noSignature,
    signatory,
  };

  // Jenis surat dengan template .docx terunggah dirender lewat pipeline
  // docxtemplater + LibreOffice; sisanya tetap layout pdf-lib bawaan.
  if (type?.templateDocx) {
    return docxTemplateService.renderLetterPdfFromDocx(type.templateDocx, input);
  }
  return generateLetterPdf(input);
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
        throw new AppError("Pengguna pemohon tidak ditemukan");
      }
      if (!isProfileComplete(requester)) {
        throw new AppError(
          `Data profil pemohon belum lengkap: ${getMissingProfileFields(requester).join(", ")}. Lengkapi dulu lewat menu Kelola Pengguna.`,
        );
      }
      requesterId = data.userId;
    }

    const type = await letterTypeRepository.findById(data.letterTypeId);
    if (!type || type.deletedAt) throw new AppError("Jenis surat tidak ditemukan");
    if (!type.active) throw new AppError("Jenis surat sedang tidak aktif");

    // tidak boleh ada 2 pengajuan jenis surat sama yang masih berjalan (DIAJUKAN/DIPROSES) sekaligus
    if (await letterRequestRepository.hasPending(requesterId, data.letterTypeId)) {
      throw new AppError(
        `Masih ada pengajuan ${type.name} yang belum disetujui. Tunggu sampai disetujui sebelum mengajukan lagi.`,
      );
    }

    const cleanData = parseLetterData(type.requiredFields, data.data);

    // pastikan tiap dokumen pendukung wajib sudah terunggah (pengaman; client juga memblok)
    const docs = getSupportingDocs(type.code, type.supportingDocs);
    const uploadedDocIndexes = new Set(attachments.map((a) => a.docIndex));
    docs.forEach((doc, i) => {
      if (doc.required && !uploadedDocIndexes.has(i)) {
        throw new AppError(`Dokumen wajib "${doc.label}" belum diunggah`);
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
      throw new AppError("Anda tidak berhak melihat pengajuan ini");
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

  // Kepala Urusan memverifikasi: DIAJUKAN -> DIPROSES
  async process(
    actor: AuthUser,
    id: string,
    appUrl: string,
    input: unknown,
  ): Promise<LetterRequestDTO> {
    requirePosition(actor, VERIFIER_CATEGORIES, "memproses surat");
    const { note, sequence } = processLetterRequestSchema.parse(input ?? {});
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DIAJUKAN") {
      throw new AppError("Surat hanya bisa diproses dari status Diajukan");
    }
    
    const type = await letterTypeRepository.findById(row.request.letterTypeId);
    if (type?.requireManualNumber && !sequence) {
      throw new AppError("Nomor urut surat wajib diisi untuk jenis surat ini", { field: "sequence" });
    }

    const now = new Date();
    // Gunakan nomor surat yang dimasukkan secara manual oleh verifikator, atau lewati jika dinonaktifkan
    let letterNumber = null;
    if (type?.requireManualNumber && sequence) {
      letterNumber = sequence;
    }
    const verificationCode = createId();

    await letterRequestRepository.update(id, {
      status: "DIPROSES",
      verifiedBy: actor.id,
      verifiedAt: now,
      letterNumber,
      verificationCode,
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DIPROSES",
      note: note ?? null,
      changedBy: actor.id,
    });

    // buat versi tanpa tanda tangan digital untuk cetak basah segera setelah verifikasi
    const processedRow = await getRowOrThrow(id);
    const pdfNoSig = await renderPdf(processedRow, appUrl, false, true);
    await savePdf(id, pdfNoSig, true);

    return toDTO(await getRowOrThrow(id));
  },

  // Kepala Desa / Sekretaris Desa menyetujui & menandatangani: DIPROSES -> DISETUJUI
  async approve(
    actor: AuthUser,
    id: string,
    input: unknown,
    appUrl: string,
  ): Promise<LetterRequestDTO> {
    requirePosition(actor, APPROVER_CATEGORIES, "menyetujui surat");
    const { note } = approveLetterRequestSchema.parse(input ?? {});
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DIPROSES") {
      throw new AppError("Surat harus berstatus Diproses sebelum disetujui");
    }

    const now = new Date();
    await letterRequestRepository.update(id, {
      status: "DISETUJUI",
      approvedBy: actor.id,
      approvedAt: now,
    });
    await letterRequestRepository.addLog({
      requestId: id,
      status: "DISETUJUI",
      note: note ?? null,
      changedBy: actor.id,
    });

    // terbitkan PDF dengan tanda tangan. Versi tanpa tanda tangan
    // sudah dibuat saat status DIPROSES.
    const approvedRow = await getRowOrThrow(id);
    const pdf = await renderPdf(approvedRow, appUrl);
    const pdfPath = await savePdf(id, pdf);

    await letterRequestRepository.update(id, { pdfPath });

    return toDTO(await getRowOrThrow(id));
  },

  // Tolak: Kepala Urusan dari DIAJUKAN, Kepala Desa/Sekdes dari DIPROSES
  async reject(
    actor: AuthUser,
    id: string,
    input: unknown,
  ): Promise<LetterRequestDTO> {
    const { reason } = rejectLetterRequestSchema.parse(input);
    const row = await getRowOrThrow(id);
    if (row.request.status === "DIAJUKAN") {
      requirePosition(actor, VERIFIER_CATEGORIES, "menolak surat pada tahap ini");
    } else if (row.request.status === "DIPROSES") {
      requirePosition(actor, APPROVER_CATEGORIES, "menolak surat pada tahap ini");
    } else {
      throw new AppError("Hanya surat Diajukan/Diproses yang bisa ditolak");
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
    requireStaff(actor);
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DISETUJUI") {
      throw new AppError("Hanya surat Disetujui yang bisa ditandai selesai");
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
    noSignature?: boolean
  ): Promise<Uint8Array> {
    const row = await getRowOrThrow(id);
    if (actor.role === "user" && row.request.userId !== actor.id) {
      throw new AppError("Anda tidak berhak mengunduh surat ini");
    }
    if (
      row.request.status !== "DISETUJUI" &&
      row.request.status !== "SELESAI" &&
      !(row.request.status === "DIPROSES" && noSignature)
    ) {
      throw new AppError("Surat belum disetujui, PDF belum bisa diunduh");
    }

    // surat normalnya sudah punya PDF tersimpan sejak di-approve (snapshot data
    // saat itu); fallback render+simpan di sini hanya untuk surat lama sebelum fitur ini ada
    if (row.request.pdfPath) {
      const stored = await readPdf(id, noSignature);
      if (stored) return stored;
    }
    const pdf = await renderPdf(row, appUrl, false, noSignature);
    await savePdf(id, pdf, noSignature);
    if (!noSignature) {
      await letterRequestRepository.update(id, { pdfPath: await savePdf(id, pdf) });
    }
    return pdf;
  },

  // Pratinjau hasil surat (semua status); kalau sudah resmi terbit, pakai snapshot
  // PDF yang sama dengan unduhan biasa, kalau belum maka dirender langsung sebagai draft
  // (tanpa nomor/QR resmi, ditandai watermark) tanpa disimpan ke disk.
  async previewPdf(id: string, actor: AuthUser, appUrl: string): Promise<Uint8Array> {
    const row = await getRowOrThrow(id);
    if (actor.role === "user" && row.request.userId !== actor.id) {
      throw new AppError("Anda tidak berhak melihat pratinjau surat ini");
    }
    if (row.request.status === "DISETUJUI" || row.request.status === "SELESAI") {
      return this.generatePdf(id, actor, appUrl);
    }
    if (row.request.status === "DIPROSES") {
      return this.generatePdf(id, actor, appUrl, true);
    }
    return renderPdf(row, appUrl, true);
  },

  // Petugas merapikan field dinamis warga (mis. salah ketik) sebelum surat diproses
  async updateData(actor: AuthUser, id: string, input: unknown): Promise<LetterRequestDTO> {
    requireStaff(actor);
    const { purpose, data } = updateLetterRequestDataSchema.parse(input);
    const row = await getRowOrThrow(id);
    if (row.request.status !== "DIAJUKAN") {
      throw new AppError("Data hanya bisa diedit sebelum surat diproses");
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
        return this.process(actor, id, appUrl, input);
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
