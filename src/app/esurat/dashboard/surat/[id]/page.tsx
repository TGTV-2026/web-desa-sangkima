import { notFound, redirect } from "next/navigation";
import LetterDetailCard from "@/components/esurat/LetterDetailCard";
import DownloadActions from "@/components/esurat/DownloadActions";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";

type PageProps = { params: Promise<{ id: string }> };

export default async function DetailSuratPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  const { id } = await params;
  let surat;
  try {
    surat = await letterRequestService.getForActor(id, session);
  } catch {
    notFound();
  }
  const logs = await letterRequestService.getLogs(id);

  return (
    <LetterDetailCard
      request={surat}
      logs={logs}
      backHref="/esurat/dashboard/surat"
      backLabel="Kembali ke Surat Saya"
    >
      <DownloadActions verificationCode={surat.verificationCode} />
    </LetterDetailCard>
  );
}
