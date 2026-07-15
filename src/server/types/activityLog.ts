// Tipe & katalog untuk audit log (lihat PRD Audit Log v0.2 §8-9).

export type ActorType = "warga" | "cms" | "system";

export const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  warga: "Warga",
  cms: "CMS",
  system: "Sistem",
};

// Katalog kode aksi + label bahasa manusia + kategori (untuk filter di UI).
// Kategori dipakai dropdown "Kategori Aksi" di halaman audit.
export type ActionCategory = "auth" | "akun" | "konten" | "rt" | "surat" | "sistem";

export const ACTION_CATEGORY_LABELS: Record<ActionCategory, string> = {
  auth: "Autentikasi",
  akun: "Perubahan Akun",
  konten: "Konten Publik",
  rt: "Laporan RT",
  surat: "Permintaan Surat",
  sistem: "Sistem",
};

type ActionDef = { label: string; category: ActionCategory };

// Sumber kebenaran kode aksi. Tambah di sini kalau menambah instrumentasi baru.
export const ACTION_CATALOG: Record<string, ActionDef> = {
  "auth.warga.login.success": { label: "Login warga berhasil", category: "auth" },
  "auth.warga.login.failed": { label: "Login warga gagal", category: "auth" },
  "auth.warga.register": { label: "Warga mendaftar", category: "auth" },
  "auth.cms.login.success": { label: "Login CMS berhasil", category: "auth" },
  "auth.cms.login.failed": { label: "Login CMS gagal", category: "auth" },
  "cms_user.create": { label: "Buat akun editor", category: "akun" },
  "cms_user.bulk_create_rt": { label: "Buat akun RT massal (CSV)", category: "akun" },
  "cms_user.role_change": { label: "Ubah peran akun", category: "akun" },
  "cms_user.update": { label: "Ubah akun CMS", category: "akun" },
  "cms_user.deactivate": { label: "Nonaktifkan akun CMS", category: "akun" },
  "cms_user.reactivate": { label: "Aktifkan ulang akun CMS", category: "akun" },
  "cms_user.delete": { label: "Hapus akun CMS", category: "akun" },
  "warga.account.update": { label: "Ubah akun warga", category: "akun" },
  "warga.account.delete": { label: "Hapus akun warga", category: "akun" },
  "content.update": { label: "Ubah konten publik", category: "konten" },
  "rt_session.open": { label: "Buka sesi pelaporan RT", category: "rt" },
  "rt_session.close": { label: "Tutup sesi RT (terbit ke publik)", category: "rt" },
  "rt_report.submit": { label: "Kumpulkan laporan RT", category: "rt" },
  "rt_report.update": { label: "Ubah laporan RT", category: "rt" },
};

/** Label ramah untuk sebuah kode aksi (fallback ke kode mentah). */
export function actionLabel(action: string): string {
  return ACTION_CATALOG[action]?.label ?? action;
}

/** Kategori sebuah aksi (untuk filter). Aksi surat dari letter_request_logs. */
export function actionCategory(action: string): ActionCategory {
  if (action.startsWith("letter.")) return "surat";
  return ACTION_CATALOG[action]?.category ?? "sistem";
}

// Data untuk MENCATAT satu aktivitas (dipakai service.record()).
export type ActivityLogInput = {
  actorType: ActorType;
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
};

// DTO untuk MENAMPILKAN (halaman audit). `source` membedakan baris dari
// activity_logs vs letter_request_logs yang ditampilkan menyatu.
export type ActivityLogDTO = {
  id: string; // "act-123" atau "letter-45" — unik lintas dua sumber
  source: "activity" | "letter";
  actorType: ActorType;
  actorName: string;
  action: string;
  actionLabel: string;
  category: ActionCategory;
  target: string;
  summary: string;
  ipAddress: string | null;
  createdAt: Date;
};

// Filter daftar log.
export type ActivityLogFilter = {
  actorType?: ActorType;
  category?: ActionCategory;
  dari?: Date;
  sampai?: Date;
  q?: string;
  limit?: number;
  offset?: number;
};
