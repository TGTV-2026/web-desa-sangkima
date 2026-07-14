import { AppError } from "../utils/appError";
import { userRepository } from "../repositories/user.repository";
import { hashPassword } from "../utils/hash";
import {
  createUserByAdminSchema,
  updateUserSchema,
  updateProfileSchema,
  type UserDTO,
  type PaginationMeta,
} from "../types/user";

type UserRow = NonNullable<
  Awaited<ReturnType<typeof userRepository.findByIdWithPosition>>
>;

function toDTO(row: UserRow): UserDTO {
  return {
    id: row.user.id,
    name: row.user.name,
    email: row.user.email,
    nik: row.user.nik,
    role: row.user.role as UserDTO["role"],
    nip: row.user.nip ?? null,
    positionId: row.user.positionId ?? null,
    positionName: row.positionName ?? null,
    religion: row.user.religion ?? null,
    address: row.user.address ?? null,
    birthday: row.user.birthday ?? null,
    placeOfBirth: row.user.placeOfBirth ?? null,
    job: row.user.job ?? null,
    gender: row.user.gender ?? null,
    telp: row.user.telp ?? null,
    citizenship: row.user.citizenship ?? null,
    status: row.user.status ?? null,
    education: row.user.education ?? null,
    signatureUrl: row.user.signatureUrl ?? null,
    emailVerifiedAt: row.user.emailVerifiedAt ?? null,
    createdAt: row.user.createdAt ?? null,
    updatedAt: row.user.updatedAt ?? null,
  };
}

export const userService = {
  async list(
    page: number,
    limit: number,
    search?: string,
    role?: "user" | "staff" | "admin",
  ): Promise<{ data: UserDTO[]; pagination: PaginationMeta }> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const term = search?.trim() || undefined;

    const { rows, total } = await userRepository.findAllPaginated(
      safePage,
      safeLimit,
      term,
      role,
    );

    return {
      data: rows.map((row) => toDTO(row as UserRow)),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  },

  async getById(id: string): Promise<UserDTO> {
    const row = await userRepository.findByIdWithPosition(id);
    if (!row) throw new AppError("User tidak ditemukan");
    return toDTO(row);
  },

  async createByAdmin(input: unknown): Promise<UserDTO> {
    const data = createUserByAdminSchema.parse(input);

    await userRepository.resolveSoftDeletedConflicts(data.email, data.nik);

    const existing = await userRepository.findByEmailOrNik(
      data.email,
      data.nik,
    );
    if (existing) {
      const conflict =
        existing.email === data.email ? "Email" : "NIK";
      throw new AppError(`${conflict} sudah digunakan`);
    }

    // warga tidak boleh punya jabatan
    if (data.role === "user") data.positionId = null;

    const passwordHash = await hashPassword(data.password);
    const row = await userRepository.createByAdmin({ ...data, passwordHash });
    if (!row) throw new AppError("Gagal membuat user");
    return toDTO(row);
  },

  async update(id: string, input: unknown): Promise<UserDTO> {
    const data = updateUserSchema.parse(input);

    const current = await userRepository.findByIdWithPosition(id);
    if (!current) throw new AppError("User tidak ditemukan");

    if (data.email && data.email !== current.user.email) {
      await userRepository.resolveSoftDeletedConflicts(data.email);
      const duplicate = await userRepository.findByEmailExcept(data.email, id);
      if (duplicate) throw new AppError("Email sudah digunakan");
    }

    if (data.nik && data.nik !== current.user.nik) {
      await userRepository.resolveSoftDeletedConflicts("", data.nik);
      const duplicate = await userRepository.findByNikExcept(data.nik, id);
      if (duplicate) throw new AppError("NIK sudah digunakan");
    }

    const { password, birthday, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };

    const finalRole = data.role ?? current.user.role;
    const finalPositionId =
      data.positionId !== undefined ? data.positionId : current.user.positionId;

    // warga tidak boleh punya jabatan
    if (finalRole === "user") updateData.positionId = null;
    // staff wajib punya jabatan
    if (finalRole === "staff" && !finalPositionId) {
      throw new AppError("Jabatan wajib diisi untuk role staff");
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (birthday !== undefined) {
      updateData.birthday = birthday ? new Date(birthday) : null;
    }

    const row = await userRepository.updateUser(
      id,
      updateData as Partial<typeof import("../db/schema").users.$inferInsert>,
    );
    if (!row) throw new AppError("Gagal memperbarui user");
    return toDTO(row);
  },

  /** Self-update profil oleh warga — hanya field kependudukan, tanpa field sensitif. */
  async updateProfile(userId: string, input: unknown): Promise<UserDTO> {
    const data = updateProfileSchema.parse(input);

    const current = await userRepository.findByIdWithPosition(userId);
    if (!current) throw new AppError("User tidak ditemukan");

    const { birthday, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    updateData.birthday = new Date(birthday);

    const row = await userRepository.updateUser(
      userId,
      updateData as Partial<typeof import("../db/schema").users.$inferInsert>,
    );
    if (!row) throw new AppError("Gagal memperbarui profil");
    return toDTO(row);
  },

  async softDelete(id: string): Promise<void> {
    const existing = await userRepository.findByIdWithPosition(id);
    if (!existing) throw new AppError("User tidak ditemukan");
    await userRepository.softDeleteUser(id);
  },
};
