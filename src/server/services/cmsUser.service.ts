import { createId } from "@paralleldrive/cuid2";
import { cmsUserRepository } from "../repositories/cmsUser.repository";
import { comparePassword, hashPassword } from "../utils/hash";
import {
  cmsLoginSchema,
  cmsUserCreateSchema,
  cmsUserUpdateSchema,
  type CmsRole,
  type CmsUserDTO,
} from "../types/cmsUser";

function toDTO(
  row: NonNullable<Awaited<ReturnType<typeof cmsUserRepository.findById>>>,
): CmsUserDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as CmsRole,
    active: !row.deletedAt,
    createdAt: row.createdAt,
  };
}

export const cmsUserService = {
  async listAll(): Promise<CmsUserDTO[]> {
    try {
      return (await cmsUserRepository.findAll()).map(toDTO);
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<CmsUserDTO | null> {
    const row = await cmsUserRepository.findById(id);
    return row ? toDTO(row) : null;
  },

  /** Verifikasi kredensial login. Return id akun bila cocok, atau lempar Error. */
  async login(input: unknown): Promise<{ id: string }> {
    const { email, password } = cmsLoginSchema.parse(input);
    const row = await cmsUserRepository.findByEmail(email);
    if (!row || row.deletedAt) {
      throw new Error("Email atau kata sandi salah");
    }
    const ok = await comparePassword(password, row.password);
    if (!ok) throw new Error("Email atau kata sandi salah");
    return { id: row.id };
  },

  async create(input: unknown): Promise<CmsUserDTO> {
    const data = cmsUserCreateSchema.parse(input);
    const existing = await cmsUserRepository.findByEmail(data.email);
    if (existing) throw new Error("Email sudah dipakai akun lain");
    const id = createId();
    await cmsUserRepository.insert({
      id,
      name: data.name,
      email: data.email,
      // Selalu editor — super_admin tidak bisa dibuat lewat UI.
      role: "editor",
      password: await hashPassword(data.password),
    });
    const created = await cmsUserRepository.findById(id);
    return toDTO(created!);
  },

  async update(id: string, input: unknown): Promise<void> {
    const data = cmsUserUpdateSchema.parse(input);
    const target = await cmsUserRepository.findById(id);
    if (!target) throw new Error("Akun tidak ditemukan");

    // Email boleh sama dengan miliknya sendiri, tapi tak boleh bentrok akun lain.
    const other = await cmsUserRepository.findByEmail(data.email);
    if (other && other.id !== id) {
      throw new Error("Email sudah dipakai akun lain");
    }

    // Peran tidak diubah lewat UI (tetap seperti semula).
    const patch: Record<string, unknown> = {
      name: data.name,
      email: data.email,
    };
    if (data.password) patch.password = await hashPassword(data.password);
    await cmsUserRepository.update(id, patch);
  },

  /** Nonaktifkan akun (soft delete) — jejak penulis tetap tersimpan. */
  async deactivate(id: string): Promise<void> {
    const target = await cmsUserRepository.findById(id);
    if (!target || target.deletedAt) return;
    if (target.role === "super_admin") {
      const count = await cmsUserRepository.countActiveSuperAdmins();
      if (count <= 1) {
        throw new Error("Minimal harus ada satu Super Admin aktif");
      }
    }
    await cmsUserRepository.update(id, { deletedAt: new Date() });
  },

  async reactivate(id: string): Promise<void> {
    await cmsUserRepository.update(id, { deletedAt: null });
  },

  /**
   * Hapus permanen. Hanya untuk akun editor — akun Super Admin tak boleh
   * dihapus permanen (cegah lockout). Byline berita/PPID tetap utuh karena
   * memakai snapshot `authorName`, bukan join ke akun.
   */
  async hardDelete(id: string): Promise<void> {
    const target = await cmsUserRepository.findById(id);
    if (!target) return;
    if (target.role === "super_admin") {
      throw new Error("Akun Super Admin tidak bisa dihapus permanen.");
    }
    await cmsUserRepository.hardDelete(id);
  },
};
