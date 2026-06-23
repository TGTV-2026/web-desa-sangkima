"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import type { LetterStatus } from "@/server/types/letter";
import RejectionPanel from "./RejectionPanel";

// Kategori jabatan — sinkron dengan konstanta di letterRequest.service.ts
const VERIFIER_CATEGORIES = ["Kepala Urusan"];
const APPROVER_CATEGORIES = ["Kepala Desa", "Sekretaris Desa"];

type Props = {
  id: string;
  status: LetterStatus;
  role: "staff" | "admin" | "user";
  positionCategory: string | null;
};

export default function PermohonanActions({ id, status, role, positionCategory }: Props) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const [showReject, setShowReject] = useState(false);

  const isVerifier = role === "staff" && !!positionCategory && VERIFIER_CATEGORIES.includes(positionCategory);
  const isApprover = role === "staff" && !!positionCategory && APPROVER_CATEGORIES.includes(positionCategory);

  const doAction = (body: Record<string, string>, successMessage: string) =>
    submit(
      () =>
        fetch(`/esurat/api/letter-requests/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      {
        successMessage,
        errorFallback: "Aksi gagal",
        onSuccess: () => {
          setShowReject(false);
          router.refresh();
        },
      },
    ).catch(() => {});

  if (status === "DITOLAK" || status === "SELESAI") {
    return null;
  }

  return (
    <div className="mt-8 border-t border-line pt-6">
      {showReject ? (
        <RejectionPanel
          busy={busy}
          onConfirm={(reason) => doAction({ action: "reject", reason }, "Permohonan ditolak.")}
          onCancel={() => setShowReject(false)}
        />
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* DIAJUKAN: Kepala Urusan bisa proses & tolak */}
          {status === "DIAJUKAN" && isVerifier && (
            <button
              onClick={() => doAction({ action: "process" }, "Permohonan mulai diproses.")}
              disabled={busy}
              className="btn-primary flex-1"
            >
              {busy ? "Memproses..." : "Proses Permohonan"}
            </button>
          )}

          {status === "DIAJUKAN" && !isVerifier && (
            <p className="flex-1 text-center text-[13px] font-semibold text-inkmut bg-paper2/50 border border-line rounded-[4px] py-3">
              Menunggu verifikasi Kepala Urusan
            </p>
          )}

          {/* DIPROSES: Kepala Desa / Sekdes bisa approve & tolak */}
          {status === "DIPROSES" && isApprover && (
            <button
              onClick={() =>
                doAction(
                  { action: "approve" },
                  "Surat disetujui — nomor surat & PDF telah diterbitkan.",
                )
              }
              disabled={busy}
              className="btn-primary flex-1 !bg-pine-700 hover:!bg-pine-600"
            >
              {busy ? "Memproses..." : "Setujui & Tandatangani"}
            </button>
          )}

          {status === "DIPROSES" && !isApprover && (
            <p className="flex-1 text-center text-[13px] font-semibold text-inkmut bg-paper2/50 border border-line rounded-[4px] py-3">
              Menunggu persetujuan Kepala Desa
            </p>
          )}

          {/* DISETUJUI: semua staff bisa tandai selesai */}
          {status === "DISETUJUI" && role === "staff" && (
            <button
              onClick={() =>
                doAction({ action: "complete" }, "Surat ditandai selesai.")
              }
              disabled={busy}
              className="btn-primary flex-1"
            >
              {busy ? "Memproses..." : "Tandai Selesai"}
            </button>
          )}

          {/* Tombol tolak: verifier saat DIAJUKAN, approver saat DIPROSES */}
          {((status === "DIAJUKAN" && isVerifier) || (status === "DIPROSES" && isApprover)) && (
            <button
              onClick={() => setShowReject(true)}
              disabled={busy}
              className="btn-danger flex-1"
            >
              Tolak Permohonan
            </button>
          )}
        </div>
      )}
    </div>
  );
}
