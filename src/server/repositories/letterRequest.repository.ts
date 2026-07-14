import { and, asc, count, desc, eq, gte, inArray, isNotNull, lt } from "drizzle-orm";
import { db } from "../db";
import {
  letterRequestLogs,
  letterRequests,
  letterTypes,
  users,
} from "../db/schema";
import type { LetterAttachment, LetterStatus } from "../types/letter";

// Kolom yang diambil untuk membentuk DTO (gabung pemohon + jenis surat)
const detailSelect = {
  request: letterRequests,
  requesterName: users.name,
  requesterNik: users.nik,
  typeCode: letterTypes.code,
  typeName: letterTypes.name,
  typeRequiredFields: letterTypes.requiredFields,
  typeSupportingDocs: letterTypes.supportingDocs,
  typeRequireManualNumber: letterTypes.requireManualNumber,
};

function joinedQuery() {
  return db
    .select(detailSelect)
    .from(letterRequests)
    .innerJoin(users, eq(letterRequests.userId, users.id))
    .innerJoin(letterTypes, eq(letterRequests.letterTypeId, letterTypes.id))
    .$dynamic();
}

export type LetterRequestJoinedRow = Awaited<
  ReturnType<typeof joinedQuery>
>[number];

type CreateValues = {
  id: string;
  userId: string;
  letterTypeId: string;
  purpose: string;
  data: Record<string, string | number | null> | null;
  attachments: LetterAttachment[] | null;
};

export const letterRequestRepository = {
  async create(values: CreateValues) {
    await db.insert(letterRequests).values({
      id: values.id,
      userId: values.userId,
      letterTypeId: values.letterTypeId,
      purpose: values.purpose,
      data: values.data,
      attachments: values.attachments,
      status: "DIAJUKAN",
    });
    return values.id;
  },

  async findById(id: string) {
    const rows = await joinedQuery()
      .where(eq(letterRequests.id, id))
      .limit(1);
    return rows[0];
  },

  async findByVerificationCode(code: string) {
    const rows = await joinedQuery()
      .where(eq(letterRequests.verificationCode, code))
      .limit(1);
    return rows[0];
  },

  // Cek apakah nomor surat sudah dipakai (kolom letter_number unik)
  async findByLetterNumber(letterNumber: string) {
    const rows = await db
      .select({ id: letterRequests.id })
      .from(letterRequests)
      .where(eq(letterRequests.letterNumber, letterNumber))
      .limit(1);
    return rows[0];
  },

  async findByUser(userId: string, status?: LetterStatus) {
    const conditions = [eq(letterRequests.userId, userId)];
    if (status) conditions.push(eq(letterRequests.status, status));
    return joinedQuery()
      .where(and(...conditions))
      .orderBy(desc(letterRequests.createdAt));
  },

  async findAll(status?: LetterStatus) {
    let q = joinedQuery();
    if (status) q = q.where(eq(letterRequests.status, status));
    return q.orderBy(desc(letterRequests.createdAt));
  },

  async findAllPaginated(status: LetterStatus | undefined, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const where = status ? eq(letterRequests.status, status) : undefined;

    const [rows, countResult] = await Promise.all([
      joinedQuery()
        .where(where)
        .orderBy(desc(letterRequests.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(letterRequests)
        .where(where),
    ]);
    return { rows, total: countResult[0]?.total ?? 0 };
  },

  async update(id: string, values: Partial<typeof letterRequests.$inferInsert>) {
    await db.update(letterRequests).set(values).where(eq(letterRequests.id, id));
  },

  async addLog(values: {
    requestId: string;
    status: LetterStatus;
    note: string | null;
    changedBy: string;
  }) {
    await db.insert(letterRequestLogs).values(values);
  },

  // Riwayat perubahan status (timeline) untuk halaman detail
  async findLogs(requestId: string) {
    return db
      .select({
        id: letterRequestLogs.id,
        status: letterRequestLogs.status,
        note: letterRequestLogs.note,
        changedByName: users.name,
        createdAt: letterRequestLogs.createdAt,
      })
      .from(letterRequestLogs)
      .leftJoin(users, eq(letterRequestLogs.changedBy, users.id))
      .where(eq(letterRequestLogs.requestId, requestId))
      .orderBy(asc(letterRequestLogs.createdAt));
  },

  // Hitung SEMUA permohonan (termasuk yang soft-deleted) yang mereferensikan
  // jenis surat ini — dipakai untuk menentukan hapus permanen vs soft delete.
  async countByLetterType(letterTypeId: string) {
    const rows = await db
      .select({ total: count() })
      .from(letterRequests)
      .where(eq(letterRequests.letterTypeId, letterTypeId));
    return rows[0]?.total ?? 0;
  },

  // Cek apakah warga masih punya pengajuan jenis surat ini yang belum kelar (belum disetujui/ditolak)
  async hasPending(userId: string, letterTypeId: string) {
    const rows = await db
      .select({ id: letterRequests.id })
      .from(letterRequests)
      .where(
        and(
          eq(letterRequests.userId, userId),
          eq(letterRequests.letterTypeId, letterTypeId),
          inArray(letterRequests.status, ["DIAJUKAN", "DIPROSES"]),
        ),
      )
      .limit(1);
    return rows.length > 0;
  },

  // Daftar letterTypeId yang masih punya pengajuan berjalan milik warga ini (untuk blokir di modal pilih jenis surat)
  async findPendingTypeIds(userId: string) {
    const rows = await db
      .selectDistinct({ letterTypeId: letterRequests.letterTypeId })
      .from(letterRequests)
      .where(
        and(
          eq(letterRequests.userId, userId),
          inArray(letterRequests.status, ["DIAJUKAN", "DIPROSES"]),
        ),
      );
    return rows.map((r) => r.letterTypeId);
  },

  // Hitung surat yang sudah disetujui dalam satu tahun (untuk nomor urut)
  async countApprovedInYear(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const rows = await db
      .select({ total: count() })
      .from(letterRequests)
      .where(
        and(
          isNotNull(letterRequests.approvedAt),
          gte(letterRequests.approvedAt, start),
          lt(letterRequests.approvedAt, end),
        ),
      );
    return rows[0]?.total ?? 0;
  },
};
