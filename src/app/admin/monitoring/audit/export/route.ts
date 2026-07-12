import type { NextRequest } from "next/server";
import { getCmsUser } from "@/server/utils/cmsSession";
import { activityLogService } from "@/server/services/activityLog.service";
import { auditFilterSchema } from "@/server/types/activityLog";

// Export hasil filter jadi CSV (US-9). Read-only, super_admin saja.
function csvCell(v: unknown): string {
  const s = v == null ? "" : typeof v === "string" ? v : JSON.stringify(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const user = await getCmsUser();
  if (!user || user.role !== "super_admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const get = (k: string) => sp.get(k) ?? undefined;
  const parsed = auditFilterSchema.safeParse({
    actorType: get("actorType"),
    action: get("action"),
    from: get("from"),
    to: get("to"),
    q: get("q"),
    page: 1,
  });
  const filter = parsed.success ? parsed.data : { page: 1 };

  const rows = await activityLogService.listForExport(filter);

  const header = [
    "Waktu",
    "Jenis Akun",
    "Nama",
    "Aksi",
    "Kode Aksi",
    "Ringkasan",
    "Target",
    "IP",
    "Metadata",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.createdAt,
        r.actorType ?? "",
        r.actorName ?? "",
        r.actionLabel,
        r.action,
        r.summary,
        r.targetType ? `${r.targetType}:${r.targetId ?? ""}` : "",
        r.ipAddress ?? "",
        r.metadata ? JSON.stringify(r.metadata) : "",
      ]
        .map(csvCell)
        .join(","),
    );
  }
  const csv = "﻿" + lines.join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-log-${stamp}.csv"`,
    },
  });
}
