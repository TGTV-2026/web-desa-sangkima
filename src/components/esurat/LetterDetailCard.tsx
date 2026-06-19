import Link from "next/link";
import StatusBadge from "@/components/esurat/StatusBadge";
import LampiranList from "@/components/esurat/LampiranList";
import RejectionReasonAlert from "@/components/esurat/RejectionReasonAlert";
import LetterMetaList from "@/components/esurat/LetterMetaList";
import LetterTimeline from "@/components/esurat/LetterTimeline";
import type { LetterLogDTO, LetterRequestDTO } from "@/server/types/letter";

export interface LetterDetailCardProps {
  request: LetterRequestDTO;
  logs: LetterLogDTO[];
  backHref: string;
  backLabel: string;
  showRequester?: boolean;
  children?: React.ReactNode;
}

/** Shell halaman detail surat: tautan kembali, kartu kop+status, alasan tolak, metadata, lampiran, dan slot aksi. */
export default function LetterDetailCard({
  request,
  logs,
  backHref,
  backLabel,
  showRequester,
  children,
}: LetterDetailCardProps) {
  return (
    <div className="max-w-2xl">
      <Link
        href={backHref}
        className="text-xs font-semibold text-brass hover:underline underline-offset-2 rise-in inline-block"
      >
        ← {backLabel}
      </Link>

      <div className="card-doc p-6 md:p-8 mt-4 rise-in" style={{ animationDelay: "80ms" }}>
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-line">
          <div>
            <p className="overline-doc !text-inkmut">{request.letterType.code}</p>
            <h1 className="font-serif text-3xl font-medium tracking-tight mt-1">
              {request.letterType.name}
            </h1>
            {request.letterNumber && (
              <p className="font-mono text-sm text-brass mt-2">
                {request.letterNumber}
              </p>
            )}
          </div>
          <StatusBadge status={request.status} />
        </div>

        {request.status === "DITOLAK" && request.rejectionReason && (
          <RejectionReasonAlert reason={request.rejectionReason} />
        )}

        <LetterMetaList request={request} showRequester={showRequester} />

        <LampiranList requestId={request.id} attachments={request.attachments} />

        <LetterTimeline logs={logs} />

        {children}
      </div>
    </div>
  );
}
