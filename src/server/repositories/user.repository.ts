import { eq, or, and, gt, isNull, not, count, desc, like } from "drizzle-orm";
import { db } from "../db";
import { users, userTokens, positions } from "../db/schema";
import { TRegisterInput } from "../types/auth";
import type { TCreateUserByAdminInput } from "../types/user";
import { createId } from "@paralleldrive/cuid2";

export const userRepository = {
  /**
   * Mengatasi konflik pada akun yang sudah dihapus (soft delete).
   * Jika ada akun yang soft-deleted tapi masih menahan email/nik ini,
   * kita tambahkan timestamp ke email/nik tersebut agar bisa dipakai mendaftar ulang.
   */
  async resolveSoftDeletedConflicts(email: string, nik?: string) {
    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (nik) conditions.push(eq(users.nik, nik));
    if (conditions.length === 0) return;

    const conflicts = await db
      .select({ id: users.id, email: users.email, nik: users.nik, deletedAt: users.deletedAt })
      .from(users)
      .where(or(...conditions));

    for (const user of conflicts) {
      if (user.deletedAt) {
        const timestamp = Date.now();
        const updates: { email?: string; nik?: string } = {};
        if (user.email === email) updates.email = `${user.email}_deleted_${timestamp}`;
        if (nik && user.nik === nik) updates.nik = `${user.nik}_deleted_${timestamp}`;

        if (Object.keys(updates).length > 0) {
          await db.update(users).set(updates).where(eq(users.id, user.id));
        }
      }
    }
  },

  async findByEmailOrNik(email: string, nik: string) {
    const result = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.nik, nik)))
      .limit(1);
    return result[0];
  },

  async findByEmail(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  },

  async findById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  },

  async createUser(data: TRegisterInput & { passwordHash: string }) {
    const newId = createId();

    await db.insert(users).values({
      id: newId,
      name: data.name,
      email: data.email,
      nik: data.nik,
      password: data.passwordHash,
    });

    return {
      id: newId,
      name: data.name,
      email: data.email,
      nik: data.nik,
      role: "user",
    };
  },

  /**
   * Create OTP token untuk user
   */
  async createOTPToken(
    userId: string,
    otp: string,
    expiresAt: Date,
  ): Promise<void> {
    await db.insert(userTokens).values({
      userId,
      token: otp,
      type: "OTP",
      meta: null,
      expiresAt,
      usedAt: null,
    });
  },

  /**
   * Find valid OTP token (belum expired dan belum dipakai)
   */
  async findValidOTPToken(userId: string, otp: string) {
    const now = new Date();
    const result = await db
      .select()
      .from(userTokens)
      .where(
        and(
          eq(userTokens.userId, userId),
          eq(userTokens.token, otp),
          eq(userTokens.type, "OTP"),
          isNull(userTokens.usedAt),
          gt(userTokens.expiresAt, now),
        ),
      )
      .limit(1);

    return result[0];
  },

  /**
   * Mark token as used
   */
  async markTokenAsUsed(tokenId: number): Promise<void> {
    await db
      .update(userTokens)
      .set({ usedAt: new Date() })
      .where(eq(userTokens.id, tokenId));
  },

  /**
   * Mark user email as verified
   */
  async verifyUserEmail(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(users.id, userId));
  },

  /**
   * Create password reset token untuk user
   */
  async createPasswordResetToken(
    userId: string,
    resetToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await db.insert(userTokens).values({
      userId,
      token: resetToken,
      type: "PasswordChange",
      meta: null,
      expiresAt,
      usedAt: null,
    });
  },

  /**
   * Find valid password reset token (belum expired dan belum dipakai)
   */
  async findValidPasswordResetToken(userId: string, resetToken: string) {
    const now = new Date();
    const result = await db
      .select()
      .from(userTokens)
      .where(
        and(
          eq(userTokens.userId, userId),
          eq(userTokens.token, resetToken),
          eq(userTokens.type, "PasswordChange"),
          isNull(userTokens.usedAt),
          gt(userTokens.expiresAt, now),
        ),
      )
      .limit(1);

    return result[0];
  },

  /**
   * Update user password
   */
  async updateUserPassword(
    userId: string,
    newPasswordHash: string,
  ): Promise<void> {
    await db
      .update(users)
      .set({ password: newPasswordHash })
      .where(eq(users.id, userId));
  },

  /**
   * Create email change token dengan meta berisi email baru
   */
  async createEmailChangeToken(
    userId: string,
    otp: string,
    newEmail: string,
    expiresAt: Date,
  ): Promise<void> {
    await db.insert(userTokens).values({
      userId,
      token: otp,
      type: "EmailChange",
      meta: { newEmail },
      expiresAt,
      usedAt: null,
    });
  },

  /**
   * Find valid email change token (belum expired dan belum dipakai)
   */
  async findValidEmailChangeToken(userId: string, otp: string) {
    const now = new Date();
    const result = await db
      .select()
      .from(userTokens)
      .where(
        and(
          eq(userTokens.userId, userId),
          eq(userTokens.token, otp),
          eq(userTokens.type, "EmailChange"),
          isNull(userTokens.usedAt),
          gt(userTokens.expiresAt, now),
        ),
      )
      .limit(1);

    return result[0];
  },

  /**
   * Update user email
   */
  async updateUserEmail(userId: string, newEmail: string): Promise<void> {
    await db.update(users).set({ email: newEmail }).where(eq(users.id, userId));
  },

  // ─── Admin User Management ────────────────────────────────────────────────

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
    role?: "user" | "staff" | "admin",
  ) {
    const offset = (page - 1) * limit;
    const term = `%${search}%`;
    const conditions = [isNull(users.deletedAt)];
    if (role) conditions.push(eq(users.role, role));
    if (search) {
      conditions.push(
        or(
          like(users.name, term),
          like(users.email, term),
          like(users.nik, term),
        )!,
      );
    }
    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      db
        .select({ user: users, positionName: positions.name })
        .from(users)
        .leftJoin(positions, eq(users.positionId, positions.id))
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(users).where(where),
    ]);
    return { rows, total: countResult[0]?.total ?? 0 };
  },

  async findByIdWithPosition(id: string) {
    const result = await db
      .select({ user: users, positionName: positions.name, positionCategory: positions.category })
      .from(users)
      .leftJoin(positions, eq(users.positionId, positions.id))
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    return result[0];
  },

  async createByAdmin(data: TCreateUserByAdminInput & { passwordHash: string }) {
    const newId = createId();
    await db.insert(users).values({
      id: newId,
      name: data.name,
      email: data.email,
      nik: data.nik,
      password: data.passwordHash,
      role: data.role,
      positionId: data.positionId ?? null,
      religion: data.religion ?? null,
      address: data.address ?? null,
      birthday: data.birthday ? new Date(data.birthday) : null,
      placeOfBirth: data.placeOfBirth ?? null,
      job: data.job ?? null,
      gender: data.gender ?? null,
      telp: data.telp ?? null,
      citizenship: data.citizenship ?? null,
      status: data.status ?? null,
      education: data.education ?? null,
      signatureUrl: data.signatureUrl ?? null,
    });
    return this.findByIdWithPosition(newId);
  },

  async updateUser(id: string, data: Partial<typeof users.$inferInsert>) {
    await db.update(users).set(data).where(eq(users.id, id));
    return this.findByIdWithPosition(id);
  },

  async softDeleteUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;

    const timestamp = Date.now();
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
        email: `${user.email}_deleted_${timestamp}`,
        nik: `${user.nik}_deleted_${timestamp}`,
      })
      .where(eq(users.id, id));
  },

  async findByEmailExcept(email: string, excludeId: string) {
    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), not(eq(users.id, excludeId))))
      .limit(1);
    return result[0];
  },

  async findByNikExcept(nik: string, excludeId: string) {
    const result = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.nik, nik), not(eq(users.id, excludeId))))
      .limit(1);
    return result[0];
  },
};
