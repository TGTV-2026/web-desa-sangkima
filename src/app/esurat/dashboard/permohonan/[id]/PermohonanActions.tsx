"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import type { LetterStatus } from "@/server/types/letter";

type Props = {
  id: string;
  status: LetterStatus;
  role: "staff" | "admin" | "user";
};

export default function PermohonanActions({ id, status, role }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const doAction = async (body: Record<string, string>, successMsg: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/esurat/api/letter-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Aksi gagal");

      toast(successMsg, "Berhasil", "success", 4000);
      setShowReject(false);
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Gagal terhubung ke server", "Gagal", "error", 5000);
    } finally {
      setBusy(false);
    }
  };

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
        <div className="flex flex-col gap-3">
          <label htmlFor="reason" className="label-doc !mb-0">
            Alasan Penolakan
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Data alamat tidak sesuai KTP"
            rows={3}
            className="input-doc focus:!border-oxide focus:!ring-oxide/15"
          />
          <div className="flex gap-3">
            <button
              onClick={() => doAction({ action: "reject", reason }, "Permohonan ditolak.")}
              disabled={busy || reason.trim().length < 3}
              className="btn-danger flex-1 !bg-oxide !text-paper !border-oxide hover:!bg-oxide/90"
            >
              {busy ? "Memproses..." : "Konfirmasi Tolak"}
            </button>
            <button
              onClick={() => setShowReject(false)}
              disabled={busy}
              className="btn-outline flex-1"
            >
              Batal
            </button>
          </div>
        </div>
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
