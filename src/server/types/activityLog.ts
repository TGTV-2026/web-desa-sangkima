import { z } from "zod";

// Audit log terpusat — lihat PRD AuditLog v0.2 (bagian 8 & 9).
// Satu tabel activity_logs mencatat aksi penting dari dua sistem akun (warga
// E-Surat & CMS) plus modul CMS/RT. Log status surat tetap di letter_request_logs
// dan hanya ditampilkan menyatu (tidak diduplikasi).

export const ACTOR_TYPES = ["warga", "cms", "system"] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

// Katalog kode aksi (PRD bagian 8) + label bahasa manusia untuk tampilan/filter.
// Kode terstruktur `domain.entitas.aksi` — dipakai apa adanya di service layer.
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "auth.warga.login.success": "Login warga berhasil",
  "auth.warga.login.failed": "Login warga gagal",
  "auth.warga.register": "Warga mendaftar akun",
  "auth.cms.login.success": "Login CMS berhasil",
  "auth.cms.login.failed": "Login CMS gagal",
  "cms_user.create": "Buat akun CMS",
  "cms_user.bulk_create_rt": "Buat akun RT massal (CSV)",
  "cms_user.role_change": "Ubah peran akun CMS",
  "cms_user.deactivate": "Nonaktifkan akun CMS",
  "cms_user.reactivate": "Aktifkan ulang akun CMS",
  "cms_user.delete": "Hapus akun CMS",
  "cms_user.password_change": "Ganti sandi sendiri (CMS)",
  "cms_user.email_change": "Ganti email sendiri (CMS)",
  "warga.account.update": "Ubah akun warga",
  "warga.account.delete": "Hapus akun warga",
  "warga.account.role_change": "Ubah peran akun warga",
  "rt_session.open": "Buka sesi Laporan RT",
  "rt_session.close": "Tutup sesi RT (terbit ke publik)",
  "rt_report.submit": "Kirim laporan RT",
  "rt_report.update": "Ubah laporan RT",
  "content.update": "Ubah konten publik",
  "news.create": "Buat berita",
  "news.update": "Ubah berita",
  "news.delete": "Hapus berita",
  "ppid.create": "Buat dokumen PPID",
  "ppid.update": "Ubah dokumen PPID",
  "ppid.delete": "Hapus dokumen PPID",
  "product.create": "Buat produk",
  "product.update": "Ubah produk",
  "product.delete": "Hapus produk",
  "album.create": "Buat album galeri",
  "album.update": "Ubah album galeri",
  "album.delete": "Hapus album galeri",
  // Sumber lama yang ditampilkan menyatu (bukan dari activity_logs):
  "letter.status_change": "Perubahan status surat",
};

// Kelompok aksi untuk dropdown filter di halaman audit.
export const AUDIT_ACTION_GROUPS: { label: string; actions: string[] }[] = [
  {
    label: "Autentikasi",
    actions: [
      "auth.warga.login.success",
      "auth.warga.login.failed",
      "auth.warga.register",
      "auth.cms.login.success",
      "auth.cms.login.failed",
    ],
  },
  {
    label: "Akun CMS",
    actions: [
      "cms_user.create",
      "cms_user.bulk_create_rt",
      "cms_user.role_change",
      "cms_user.deactivate",
      "cms_user.reactivate",
      "cms_user.delete",
      "cms_user.password_change",
      "cms_user.email_change",
    ],
  },
  {
    label: "Akun Warga",
    actions: [
      "warga.account.update",
      "warga.account.delete",
      "warga.account.role_change",
    ],
  },
  {
    label: "Laporan RT",
    actions: [
      "rt_session.open",
      "rt_session.close",
      "rt_report.submit",
      "rt_report.update",
    ],
  },
  {
    label: "Konten Publik",
    actions: [
      "content.update",
      "news.create",
      "news.update",
      "news.delete",
      "ppid.create",
      "ppid.update",
      "ppid.delete",
      "product.create",
      "product.update",
      "product.delete",
      "album.create",
      "album.update",
      "album.delete",
    ],
  },
  { label: "Surat", actions: ["letter.status_change"] },
];

export function actionLabel(code: string): string {
  return AUDIT_ACTION_LABELS[code] ?? code;
}

// Input pencatatan (dipanggil dari service layer, fire-and-forget).
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

// DTO tampilan — menyatukan activity_logs & letter_request_logs.
export type AuditEntryDTO = {
  id: string; // "a<id>" untuk activity, "l<id>" untuk log surat (unik lintas sumber)
  source: "activity" | "letter";
  actorType: ActorType | null;
  actorName: string | null;
  action: string;
  actionLabel: string;
  summary: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string; // ISO
};

// Filter halaman audit (dibaca dari query string di Server Component).
export const auditFilterSchema = z.object({
  actorType: z.enum(ACTOR_TYPES).optional(),
  action: z.string().min(1).optional(),
  from: z.string().optional(), // YYYY-MM-DD
  to: z.string().optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
});
export type AuditFilter = z.infer<typeof auditFilterSchema>;

export const AUDIT_PAGE_SIZE = 50;
