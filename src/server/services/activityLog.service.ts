import { activityLogRepository } from "../repositories/activityLog.repository";
import {
  ACTION_CATALOG,
  actionCategory,
  actionLabel,
  type ActivityLogDTO,
  type ActivityLogFilter,
  type ActivityLogInput,
  type ActorType,
} from "../types/activityLog";

// Batas aman menggabungkan dua sumber log di memori. Volume aksi P0/P1 rendah
// (bukan per-request), jadi ini cukup untuk halaman audit desa.
const MERGE_CAP = 500;

type ActivityRow = Awaited<
  ReturnType<typeof activityLogRepository.listActivity>
>[number];
type LetterRow = Awaited<
  ReturnType<typeof activityLogRepository.listLetterLogs>
>[number];

function mapActivity(r: ActivityRow): ActivityLogDTO {
  return {
    id: `act-${r.id}`,
    source: "activity",
    actorType: r.actorType as ActorType,
    actorName: r.actorName ?? "—",
    action: r.action,
    actionLabel: actionLabel(r.action),
    category: actionCategory(r.action),
    target: [r.targetType, r.targetId].filter(Boolean).join(": ") || "—",
    summary: r.summary,
    ipAddress: r.ipAddress ?? null,
    createdAt: r.createdAt ?? new Date(0),
  };
}

function mapLetter(r: LetterRow): ActivityLogDTO {
  return {
    id: `letter-${r.id}`,
    source: "letter",
    actorType: "warga",
    actorName: r.actorName ?? "—",
    action: "letter.status_change",
    actionLabel: `Surat → ${r.status}`,
    category: "surat",
    target: r.letterNumber ?? r.requestId,
    summary: r.note ?? `Status pengajuan menjadi ${r.status}.`,
    ipAddress: null,
    createdAt: r.createdAt ?? new Date(0),
  };
}

export const activityLogService = {
  /**
   * Catat satu aktivitas. FAIL-SAFE: kegagalan pencatatan TIDAK boleh
   * menggagalkan aksi utama (approval surat, dll) — cukup ke log server.
   * Panggil "fire-and-forget" setelah aksi utama sukses.
   */
  async record(entry: ActivityLogInput): Promise<void> {
    try {
      await activityLogRepository.insert(entry);
    } catch (err) {
      console.error("[audit] gagal mencatat aktivitas", err);
    }
  },

  /**
   * Daftar log menyatu (activity_logs + letter_request_logs), diurut terbaru
   * dulu, dengan filter & paginasi sederhana.
   */
  async list(
    filter: ActivityLogFilter,
  ): Promise<{ items: ActivityLogDTO[]; total: number }> {
    const limit = filter.limit ?? 50;
    const offset = filter.offset ?? 0;
    const cat = filter.category;

    // Log surat hanya relevan bila kategori tak dibatasi ke selain "surat",
    // dan aktor bukan CMS/sistem (log surat berasal dari akun warga E-Surat).
    const includeActivity = cat !== "surat";
    const includeLetter =
      (!cat || cat === "surat") &&
      filter.actorType !== "cms" &&
      filter.actorType !== "system";

    // Untuk kategori non-surat, batasi aksi ke kategori itu.
    let actions: string[] | undefined;
    if (cat && cat !== "surat") {
      actions = Object.entries(ACTION_CATALOG)
        .filter(([, d]) => d.category === cat)
        .map(([k]) => k);
    }

    const [acts, letters] = await Promise.all([
      includeActivity
        ? activityLogRepository.listActivity({
            actorType: filter.actorType,
            actions,
            dari: filter.dari,
            sampai: filter.sampai,
            q: filter.q,
            limit: MERGE_CAP,
          })
        : Promise.resolve([] as ActivityRow[]),
      includeLetter
        ? activityLogRepository.listLetterLogs({
            dari: filter.dari,
            sampai: filter.sampai,
            q: filter.q,
            limit: MERGE_CAP,
          })
        : Promise.resolve([] as LetterRow[]),
    ]);

    const merged = [...acts.map(mapActivity), ...letters.map(mapLetter)].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return { items: merged.slice(offset, offset + limit), total: merged.length };
  },

  /** Ringkasan untuk dashboard: jumlah log 24 jam + login gagal 24 jam. */
  async ringkasan24Jam(): Promise<{ totalLog: number; loginGagal: number }> {
    const dari = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const rows = await activityLogRepository.listActivity({
      dari,
      limit: MERGE_CAP,
    });
    const loginGagal = rows.filter((r) => r.action.endsWith("login.failed")).length;
    return { totalLog: rows.length, loginGagal };
  },

  /**
   * Tren login 7 hari terakhir untuk grafik dashboard: jumlah login sukses
   * per hari, dipisah warga vs CMS.
   */
  async trenLogin7Hari(): Promise<
    { tanggal: string; warga: number; cms: number }[]
  > {
    const dari = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await activityLogRepository.listActivity({
      dari,
      actions: ["auth.warga.login.success", "auth.cms.login.success"],
      limit: MERGE_CAP,
    });
    const byDay = new Map<string, { warga: number; cms: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      byDay.set(d.toISOString().slice(0, 10), { warga: 0, cms: 0 });
    }
    for (const r of rows) {
      const key = (r.createdAt ?? new Date()).toISOString().slice(0, 10);
      const bucket = byDay.get(key);
      if (!bucket) continue;
      if (r.actorType === "warga") bucket.warga += 1;
      else if (r.actorType === "cms") bucket.cms += 1;
    }
    return [...byDay.entries()].map(([tanggal, v]) => ({ tanggal, ...v }));
  },
};
