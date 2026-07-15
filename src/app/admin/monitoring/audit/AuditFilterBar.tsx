"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import {
  ACTION_CATEGORY_LABELS,
  ACTOR_TYPE_LABELS,
  type ActivityLogFilter,
} from "@/server/types/activityLog";
import { exportAuditCsv } from "./actions";

// Bilah filter halaman audit. Menyetel query param di URL; halaman (Server
// Component) yang membaca & meng-query — jadi filter bisa di-bookmark & share.
export default function AuditFilterBar({
  current,
}: {
  current: {
    actorType?: string;
    category?: string;
    dari?: string;
    sampai?: string;
    q?: string;
  };
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // ganti filter → balik ke halaman 1
    router.push(`/admin/monitoring/audit?${next.toString()}`);
  }

  function unduhCsv() {
    startTransition(async () => {
      try {
        const filter: ActivityLogFilter = {
          actorType: current.actorType as ActivityLogFilter["actorType"],
          category: current.category as ActivityLogFilter["category"],
          dari: current.dari ? new Date(current.dari) : undefined,
          sampai: current.sampai ? new Date(current.sampai) : undefined,
          q: current.q || undefined,
        };
        const csv = await exportAuditCsv(filter);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        toast("Gagal mengekspor log.", "Gagal", "error");
      }
    });
  }

  return (
    <div className="card-doc flex flex-wrap items-end gap-3 p-4">
      <label className="flex flex-col gap-1">
        <span className="label-doc text-[10px]">Tipe Aktor</span>
        <select
          className="input-doc px-2 py-1.5 text-sm"
          value={current.actorType ?? ""}
          onChange={(e) => setParam("actorType", e.target.value)}
        >
          <option value="">Semua Aktor</option>
          {Object.entries(ACTOR_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="label-doc text-[10px]">Kategori Aksi</span>
        <select
          className="input-doc px-2 py-1.5 text-sm"
          value={current.category ?? ""}
          onChange={(e) => setParam("category", e.target.value)}
        >
          <option value="">Semua Aksi</option>
          {Object.entries(ACTION_CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="label-doc text-[10px]">Dari</span>
        <input
          type="date"
          className="input-doc px-2 py-1.5 text-sm"
          value={current.dari ?? ""}
          onChange={(e) => setParam("dari", e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="label-doc text-[10px]">Sampai</span>
        <input
          type="date"
          className="input-doc px-2 py-1.5 text-sm"
          value={current.sampai ?? ""}
          onChange={(e) => setParam("sampai", e.target.value)}
        />
      </label>

      <label className="flex min-w-40 flex-1 flex-col gap-1">
        <span className="label-doc text-[10px]">Cari (aktor / ringkasan)</span>
        <input
          type="search"
          className="input-doc px-2 py-1.5 text-sm"
          placeholder="ketik lalu Enter…"
          defaultValue={current.q ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
          }}
        />
      </label>

      <button
        type="button"
        onClick={unduhCsv}
        disabled={pending}
        className="btn-outline text-xs disabled:opacity-50"
      >
        {pending ? "Menyiapkan…" : "Export CSV"}
      </button>
    </div>
  );
}
