import { z } from "zod";
import { religions, maritalStatus, educations } from "../db/schema/users";

/* ---------- */
/* Schemas    */
/* ---------- */

export const createUserByAdminSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    nik: z
      .string()
      .length(16, "NIK harus tepat 16 digit angka")
      .regex(/^\d+$/, "NIK hanya boleh berisi angka"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    role: z.enum(["user", "staff", "admin"]).default("user"),
    positionId: z.string().optional().nullable(),
    religion: z.enum(religions).optional().nullable(),
    address: z.string().optional().nullable(),
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
      .optional()
      .nullable(),
    placeOfBirth: z.string().optional().nullable(),
    job: z.string().optional().nullable(),
    gender: z.enum(["L", "P"]).optional().nullable(),
    telp: z.string().optional().nullable(),
    citizenship: z.enum(["wni", "wna"]).optional().nullable(),
    status: z.enum(maritalStatus).optional().nullable(),
    education: z.enum(educations).optional().nullable(),
    signatureUrl: z.string().optional().nullable(),
  })
  .refine((data) => data.role !== "staff" || !!data.positionId, {
    message: "Jabatan wajib diisi untuk role staff",
    path: ["positionId"],
  });

export const updateUserSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter").optional(),
    email: z.string().email("Format email tidak valid").optional(),
    nik: z
      .string()
      .length(16, "NIK harus tepat 16 digit angka")
      .regex(/^\d+$/, "NIK hanya boleh berisi angka")
      .optional(),
    password: z.string().min(8, "Password minimal 8 karakter").optional(),
    role: z.enum(["user", "staff", "admin"]).optional(),
    positionId: z.string().optional().nullable(),
    religion: z.enum(religions).optional().nullable(),
    address: z.string().optional().nullable(),
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
      .optional()
      .nullable(),
    placeOfBirth: z.string().optional().nullable(),
    job: z.string().optional().nullable(),
    gender: z.enum(["L", "P"]).optional().nullable(),
    telp: z.string().optional().nullable(),
    citizenship: z.enum(["wni", "wna"]).optional().nullable(),
    status: z.enum(maritalStatus).optional().nullable(),
    education: z.enum(educations).optional().nullable(),
    signatureUrl: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi",
  });

/** Self-update profil oleh warga — semua field kependudukan wajib diisi. */
export const updateProfileSchema = z.object({
  gender: z.enum(["L", "P"], "Jenis kelamin wajib dipilih"),
  placeOfBirth: z.string().min(1, "Tempat lahir wajib diisi"),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  religion: z.enum(religions, "Agama wajib dipilih"),
  address: z.string().min(1, "Alamat wajib diisi"),
  job: z.string().min(1, "Pekerjaan wajib diisi"),
  telp: z
    .string()
    .min(1, "No. HP wajib diisi")
    .regex(
      /^(\+62|62|0)8[1-9]\d{6,10}$/,
      "Format nomor HP tidak valid (contoh: 081234567890)",
    ),
  citizenship: z.enum(["wni", "wna"], "Kewarganegaraan wajib dipilih"),
  status: z.enum(maritalStatus, "Status perkawinan wajib dipilih"),
  education: z.enum(educations, "Pendidikan terakhir wajib dipilih"),
  signatureUrl: z.string().optional().nullable(),
});

/* ---------- */
/* Types      */
/* ---------- */

export type TCreateUserByAdminInput = z.infer<typeof createUserByAdminSchema>;
export type TUpdateUserInput = z.infer<typeof updateUserSchema>;
export type TUpdateProfileInput = z.infer<typeof updateProfileSchema>;

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  nik: string;
  role: "user" | "staff" | "admin";
  positionId: string | null;
  positionName: string | null;
  religion: string | null;
  address: string | null;
  birthday: Date | null;
  placeOfBirth: string | null;
  job: string | null;
  gender: string | null;
  telp: string | null;
  citizenship: string | null;
  status: string | null;
  education: string | null;
  signatureUrl: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/** Field yang harus non-null agar profil dianggap lengkap. */
export const PROFILE_REQUIRED_FIELDS = [
  "gender",
  "placeOfBirth",
  "birthday",
  "religion",
  "address",
  "job",
  "telp",
  "citizenship",
  "status",
  "education",
] as const;

type ProfileFields = Pick<UserDTO, (typeof PROFILE_REQUIRED_FIELDS)[number]>;

/** Cek apakah semua field kependudukan sudah diisi. */
export function isProfileComplete(user: ProfileFields): boolean {
  return PROFILE_REQUIRED_FIELDS.every(
    (field) => user[field] !== null && user[field] !== undefined,
  );
}

/** Daftar nama field yang masih kosong. */
export function getMissingProfileFields(user: ProfileFields): string[] {
  const labels: Record<string, string> = {
    gender: "Jenis Kelamin",
    placeOfBirth: "Tempat Lahir",
    birthday: "Tanggal Lahir",
    religion: "Agama",
    address: "Alamat",
    job: "Pekerjaan",
    telp: "No. HP",
    citizenship: "Kewarganegaraan",
    status: "Status Perkawinan",
    education: "Pendidikan Terakhir",
  };
  return PROFILE_REQUIRED_FIELDS.filter(
    (field) => user[field] === null || user[field] === undefined,
  ).map((field) => labels[field] ?? field);
}

export type { PaginationMeta } from "./pagination";
