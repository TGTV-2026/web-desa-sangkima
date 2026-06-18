export interface DownloadActionsProps {
  requestId: string;
  verificationCode?: string | null;
}

/** Tombol unduh PDF + cek keaslian untuk surat yang sudah disetujui/selesai. */
export default function DownloadActions({ requestId, verificationCode }: DownloadActionsProps) {
  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3">
      <a
        href={`/esurat/api/letter-requests/${requestId}/pdf`}
        target="_blank"
        className="btn-primary flex-1"
      >
        Unduh Surat (PDF)
      </a>
      {verificationCode && (
        <a
          href={`/esurat/verifikasi/${verificationCode}`}
          target="_blank"
          className="btn-outline flex-1"
        >
          Cek Keaslian
        </a>
      )}
    </div>
  );
}
