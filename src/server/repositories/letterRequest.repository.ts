import { createId } from "@paralleldrive/cuid2";
import { and, count, desc, eq, gte, isNotNull, lt } from "drizzle-orm";
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
  userId: string;
  letterTypeId: string;
  purpose: string;
  data: Record<string, string | number | null> | null;
  attachments: LetterAttachment[] | null;
};

export const letterRequestRepository = {
  async create(values: CreateValues) {
    const id = createId();
    await db.insert(letterRequests).values({
      id,
      userId: values.userId,
      letterTypeId: values.letterTypeId,
      purpose: values.purpose,
      data: values.data,
      attachments: values.attachments,
      status: "DIAJUKAN",
    });
    return id;
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
