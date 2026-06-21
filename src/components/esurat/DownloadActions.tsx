export interface DownloadActionsProps {
  verificationCode?: string | null;
}

/** Tautan cek keaslian publik untuk surat yang sudah disetujui/selesai (unduh PDF sudah ada di pratinjau kartu detail). */
export default function DownloadActions({ verificationCode }: DownloadActionsProps) {
  if (!verificationCode) return null;
  return (
    <a
      href={`/esurat/verifikasi/${verificationCode}`}
      target="_blank"
      className="btn-outline w-full mt-8 text-center"
    >
      Cek Keaslian
    </a>
  );
}
