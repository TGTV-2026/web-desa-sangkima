"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import type { LetterStatus } from "@/server/types/letter";
import RejectionPanel from "./RejectionPanel";

type Props = {
  id: string;
  status: LetterStatus;
  role: "staff" | "admin" | "user";
};

export default function PermohonanActions({ id, status, role }: Props) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const [showReject, setShowReject] = useState(false);

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
    return status === "SELESAI" ? (
      <a
        href={`/esurat/api/letter-requests/${id}/pdf`}
        target="_blank"
        className="btn-outline w-full mt-8"
      >
        Lihat Surat (PDF)
      </a>
    ) : null;
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
          {status === "DIAJUKAN" && (
            <button
              onClick={() => doAction({ action: "process" }, "Permohonan mulai diproses.")}
              disabled={busy}
              className="btn-primary flex-1"
            >
              {busy ? "Memproses..." : "Proses Permohonan"}
            </button>
          )}

          {status === "DIPROSES" &&
            (role === "admin" ? (
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
                {busy ? "Memproses..." : "Setujui & Terbitkan"}
              </button>
            ) : (
              <p className="flex-1 text-center text-[13px] font-semibold text-inkmut bg-paper2/50 border border-line rounded-[4px] py-3">
                Menunggu persetujuan Kepala Desa
              </p>
            ))}

          {status === "DISETUJUI" && (
            <>
              <button
                onClick={() =>
                  doAction({ action: "complete" }, "Surat ditandai selesai.")
                }
                disabled={busy}
                className="btn-primary flex-1"
              >
                {busy ? "Memproses..." : "Tandai Selesai"}
              </button>
              <a
                href={`/esurat/api/letter-requests/${id}/pdf`}
                target="_blank"
                className="btn-outline flex-1"
              >
                Lihat PDF
              </a>
            </>
          )}

          {(status === "DIAJUKAN" || status === "DIPROSES") && (
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
