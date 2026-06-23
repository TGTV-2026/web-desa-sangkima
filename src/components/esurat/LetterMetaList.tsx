import { formatTanggalWaktu } from "@/lib/format";
import type { LetterRequestDTO } from "@/server/types/letter";

export interface LetterMetaListProps {
  request: Pick<
    LetterRequestDTO,
    "requester" | "purpose" | "data" | "letterType" | "createdAt" | "approvedAt"
  >;
  showRequester?: boolean;
  // pengganti tampilan field dinamis read-only (mis. form edit untuk petugas)
  fieldsSlot?: React.ReactNode;
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 py-2.5 border-b border-dotted border-line">
      <dt className="text-inkmut capitalize">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}

/** Definition list metadata permohonan surat (pemohon, keperluan, field dinamis, tanggal). */
export default function LetterMetaList({ request, showRequester, fieldsSlot }: LetterMetaListProps) {
  return (
    <>
      <dl className="text-sm mt-6 lg:mt-0">
        {showRequester && (
          <>
            <MetaRow label="Pemohon" value={request.requester.name} />
            <MetaRow
              label="NIK"
              value={<span className="font-mono text-[13px]">{request.requester.nik}</span>}
            />
          </>
        )}

        {!fieldsSlot && <MetaRow label="Keperluan" value={request.purpose} />}

        {!fieldsSlot &&
          request.data &&
          Object.entries(request.data).map(([k, v]) => {
            const label =
              request.letterType.requiredFields.find((f) => f.name === k)?.label ??
              k.replace(/([A-Z])/g, " $1").toLowerCase();
            return <MetaRow key={k} label={label} value={String(v ?? "-")} />;
          })}
      </dl>

      {fieldsSlot}

      <dl className="text-sm">
        <MetaRow label="Diajukan" value={formatTanggalWaktu(request.createdAt)} />

        {request.approvedAt && (
          <MetaRow label="Disetujui" value={formatTanggalWaktu(request.approvedAt)} />
        )}
      </dl>
    </>
  );
}
