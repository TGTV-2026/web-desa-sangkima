"use server";

import { requireSuperAdmin } from "@/server/utils/cmsSession";
import { activityLogService } from "@/server/services/activityLog.service";
import { formatTanggalWaktu } from "@/lib/format";
import { ACTOR_TYPE_LABELS } from "@/server/types/activityLog";
import type { ActivityLogFilter } from "@/server/types/activityLog";

/** Escape satu sel CSV (bungkus tanda kutip bila perlu). */
function sel(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/**
 * Export hasil filter jadi CSV (US-9). Ambil lebih banyak baris dari tampilan
 * (limit besar) supaya export tak terpotong paginasi layar.
 */
export async function exportAuditCsv(filter: ActivityLogFilter): Promise<string> {
  await requireSuperAdmin();
  const { items } = await activityLogService.list({ ...filter, limit: 5000, offset: 0 });
  const header = ["Waktu", "Tipe Aktor", "Aktor", "Aksi", "Target", "Ringkasan", "IP"];
  const rows = items.map((i) =>
    [
      formatTanggalWaktu(i.createdAt),
      ACTOR_TYPE_LABELS[i.actorType],
      i.actorName,
      i.actionLabel,
      i.target,
      i.summary,
      i.ipAddress ?? "",
    ]
      .map((c) => sel(String(c)))
      .join(","),
  );
  return [header.join(","), ...rows].join("\r\n");
}
