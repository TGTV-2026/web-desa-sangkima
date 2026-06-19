import { formatTanggalWaktu } from "@/lib/format";
import { LETTER_STATUS_META, type LetterLogDTO } from "@/server/types/letter";

const DOT_CLASSES: Record<LetterLogDTO["status"], string> = {
  DIAJUKAN: "bg-inkmut",
  DIPROSES: "bg-brass",
  DISETUJUI: "bg-pine-600",
  DITOLAK: "bg-oxide",
  SELESAI: "bg-pine-800",
};

/** Riwayat perubahan status pengajuan (status, tanggal, oleh siapa). */
export default function LetterTimeline({ logs }: { logs: LetterLogDTO[] }) {
  if (logs.length === 0) return null;

  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="label-doc">Riwayat Status</p>
      <ul className="flex flex-col mt-3">
        {logs.map((log, i) => (
          <li key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${DOT_CLASSES[log.status]}`} />
              {i < logs.length - 1 && <span className="w-px flex-1 bg-line mt-1" />}
            </div>
            <div className="min-w-0 pb-5">
              <p className="text-sm font-semibold text-ink">
                {LETTER_STATUS_META[log.status]?.label ?? log.status}
              </p>
              <p className="text-xs text-inkmut mt-0.5">
                {formatTanggalWaktu(log.createdAt)} · oleh{" "}
                {log.changedByName ?? "Sistem"}
              </p>
              {log.note && (
                <p className="text-xs text-ink bg-paper2/40 border-l-2 border-line px-3 py-1.5 mt-1.5 rounded-sm">
                  {log.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
