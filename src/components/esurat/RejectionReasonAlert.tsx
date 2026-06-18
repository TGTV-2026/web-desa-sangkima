export interface RejectionReasonAlertProps {
  reason: string;
}

/** Kotak alasan penolakan pada halaman detail surat berstatus DITOLAK. */
export default function RejectionReasonAlert({ reason }: RejectionReasonAlertProps) {
  return (
    <div className="bg-oxide/[0.05] border border-oxide/30 rounded-[4px] px-4 py-3 mt-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-oxide">
        Alasan Penolakan
      </p>
      <p className="text-sm text-ink mt-1.5">{reason}</p>
    </div>
  );
}
