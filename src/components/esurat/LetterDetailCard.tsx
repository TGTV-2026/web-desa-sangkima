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
  fieldsSlot?: React.ReactNode;
  children?: React.ReactNode;
}

/** Shell halaman detail surat: tautan kembali, kartu kop+status, alasan tolak, metadata, lampiran, dan slot aksi. */
export default function LetterDetailCard({
  request,
  logs,
  backHref,
  backLabel,
  showRequester,
  fieldsSlot,
  children,
}: LetterDetailCardProps) {
  return (
    <div className="max-w-6xl">
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

        {/* Desktop: info (kiri) + pratinjau sticky (kanan); mobile: satu kolom urut sama */}
        <div className="mt-6 grid gap-8 lg:grid-cols-5 lg:items-start">
          {/* KOLOM INFO */}
          <div className="lg:col-span-3">
            <LetterMetaList request={request} showRequester={showRequester} fieldsSlot={fieldsSlot} />

            <LampiranList
              requestId={request.id}
              attachments={request.attachments}
              letterTypeCode={request.letterType.code}
            />

            <LetterTimeline logs={logs} />
          </div>

          {/* KOLOM PRATINJAU */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
            <div className="mt-6 border-t border-line pt-5 lg:mt-0 lg:border-t-0 lg:pt-0">
              <p className="label-doc">
                {request.status === "DISETUJUI" || request.status === "SELESAI"
                  ? "Surat Terbit"
                  : "Pratinjau Surat"}
              </p>
              <iframe
                key={request.status}
                src={`/esurat/api/letter-requests/${request.id}/preview`}
                title="Pratinjau surat"
                className="w-full aspect-[210/297] border border-line rounded-sm mt-3 bg-paper2/20"
              />
              {(request.status === "DISETUJUI" || request.status === "SELESAI") && (
                <a
                  href={`/esurat/api/letter-requests/${request.id}/pdf`}
                  target="_blank"
                  className="btn-primary w-full mt-4 text-center"
                >
                  Unduh Surat (PDF)
                </a>
              )}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
