import { eq, or, and, gt, isNull, not, count, desc } from "drizzle-orm";
import { db } from "../db";
import { users, userTokens, positions } from "../db/schema";
import { TRegisterInput } from "../types/auth";
import type { TCreateUserByAdminInput } from "../types/user";
import { createId } from "@paralleldrive/cuid2";

export const userRepository = {
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

  async findAllPaginated(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const [rows, countResult] = await Promise.all([
      db
        .select({ user: users, positionName: positions.name })
        .from(users)
        .leftJoin(positions, eq(users.positionId, positions.id))
        .where(isNull(users.deletedAt))
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(users)
        .where(isNull(users.deletedAt)),
    ]);
    return { rows, total: countResult[0]?.total ?? 0 };
  },

  async findByIdWithPosition(id: string) {
    const result = await db
      .select({ user: users, positionName: positions.name })
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
    });
    return this.findByIdWithPosition(newId);
  },

  async updateUser(id: string, data: Partial<typeof users.$inferInsert>) {
    await db.update(users).set(data).where(eq(users.id, id));
    return this.findByIdWithPosition(id);
  },

  async softDeleteUser(id: string): Promise<void> {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
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
