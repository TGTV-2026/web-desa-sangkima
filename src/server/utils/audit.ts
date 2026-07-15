import { activityLogService } from "../services/activityLog.service";
import { getClientIp } from "./clientIp";
import type { CmsSessionUser } from "./cmsSession";

// Pembungkus tipis di atas activityLogService.record() untuk aksi CMS —
// mengisi actorType, nama+peran pelaku, dan IP secara seragam supaya
// instrumentasi di action layer cukup satu baris. FAIL-SAFE mengikuti record().

type Detail = {
  targetType?: string;
  targetId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

/** Catat aksi yang dilakukan akun CMS (super_admin/editor/rt). */
export async function catatAksiCms(
  me: Pick<CmsSessionUser, "id" | "name" | "role">,
  action: string,
  detail: Detail,
): Promise<void> {
  await activityLogService.record({
    actorType: "cms",
    actorId: me.id,
    actorName: `${me.name} (${me.role})`,
    action,
    targetType: detail.targetType ?? null,
    targetId: detail.targetId ?? null,
    summary: detail.summary,
    metadata: detail.metadata ?? null,
    ipAddress: await getClientIp(),
  });
}

/** Catat aksi login (bisa gagal → pelaku hanya diketahui dari email/nama). */
export async function catatLogin(opts: {
  actorType: "warga" | "cms";
  actorId?: string | null;
  actorName: string;
  action: string;
  summary: string;
}): Promise<void> {
  await activityLogService.record({
    actorType: opts.actorType,
    actorId: opts.actorId ?? null,
    actorName: opts.actorName,
    action: opts.action,
    summary: opts.summary,
    ipAddress: await getClientIp(),
  });
}
