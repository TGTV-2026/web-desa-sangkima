import { activityLogRepository } from "../repositories/activityLog.repository";
import {
  actionLabel,
  AUDIT_PAGE_SIZE,
  type ActivityLogInput,
  type AuditEntryDTO,
  type AuditFilter,
} from "../types/activityLog";

// Apakah log surat (letter.status_change) ikut ditampilkan untuk filter ini?
// - actorType 'cms'/'system' → tidak (log surat berasal dari akun warga)
// - filter action ada & bukan letter.status_change → tidak
function includeLetterLogs(f: AuditFilter): boolean {
  if (f.actorType === "cms" || f.actorType === "system") return false;
  if (f.action && f.action !== "letter.status_change") return false;
  return true;
}

// Hanya activity_logs (bukan letter) untuk filter action non-surat.
function includeActivityLogs(f: AuditFilter): boolean {
  return f.action !== "letter.status_change";
}

type LetterRow = Awaited<
  ReturnType<typeof activityLogRepository.listLetterLogs>
>[number];
type ActivityRow = Awaited<
  ReturnType<typeof activityLogRepository.listActivity>
>[number];

function activityToDTO(r: ActivityRow): AuditEntryDTO {
  return {
    id: `a${r.id}`,
    source: "activity",
    actorType: r.actorType,
    actorName: r.actorName,
    action: r.action,
    actionLabel: actionLabel(r.action),
    summary: r.summary,
    targetType: r.targetType,
    targetId: r.targetId,
    metadata: r.metadata ?? null,
    ipAddress: r.ipAddress,
    createdAt: (r.createdAt ?? new Date()).toISOString(),
  };
}

function letterToDTO(r: LetterRow): AuditEntryDTO {
  return {
    id: `l${r.id}`,
    source: "letter",
    actorType: "warga",
    actorName: r.actorName,
    action: "letter.status_change",
    actionLabel: actionLabel("letter.status_change"),
    summary: `Status surat → ${r.status}${r.note ? ` — ${r.note}` : ""}`,
    targetType: "letter_request",
    targetId: r.requestId,
    metadata: { status: r.status, note: r.note ?? undefined },
    ipAddress: null,
    createdAt: (r.createdAt ?? new Date()).toISOString(),
  };
}

async function collect(f: AuditFilter, cap: number): Promise<AuditEntryDTO[]> {
  const [activity, letters] = await Promise.all([
    includeActivityLogs(f)
      ? activityLogRepository.listActivity(f, cap)
      : Promise.resolve([] as ActivityRow[]),
    includeLetterLogs(f)
      ? activityLogRepository.listLetterLogs(f, cap)
      : Promise.resolve([] as LetterRow[]),
  ]);
  return [...activity.map(activityToDTO), ...letters.map(letterToDTO)].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  );
}

export const activityLogService = {
  // Pencatatan fail-safe: kegagalan log TAK BOLEH menggagalkan aksi utama.
  // Dipanggil "fire-and-forget" (`void activityLogService.record(...)`).
  async record(entry: ActivityLogInput): Promise<void> {
    try {
      await activityLogRepository.insert(entry);
    } catch (err) {
      console.error("[audit] gagal mencatat aktivitas", err);
    }
  },

  // Daftar menyatu (activity_logs + letter_request_logs), terbaru dulu, paginasi.
  // Volume rendah (aksi P0/P1, bukan per-request) → over-fetch lalu merge aman.
  async list(
    f: AuditFilter,
  ): Promise<{ entries: AuditEntryDTO[]; page: number; hasMore: boolean }> {
    const page = f.page ?? 1;
    const cap = page * AUDIT_PAGE_SIZE + 1;
    const merged = await collect(f, cap);
    const start = (page - 1) * AUDIT_PAGE_SIZE;
    const entries = merged.slice(start, start + AUDIT_PAGE_SIZE);
    return { entries, page, hasMore: merged.length > page * AUDIT_PAGE_SIZE };
  },

  // Untuk export CSV — ambil banyak (dibatasi agar tak membebani).
  async listForExport(f: AuditFilter): Promise<AuditEntryDTO[]> {
    return collect(f, 5000);
  },
};
