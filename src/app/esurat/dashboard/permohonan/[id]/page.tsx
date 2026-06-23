import { notFound, redirect } from "next/navigation";
import LetterDetailCard from "@/components/esurat/LetterDetailCard";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import PermohonanActions from "./PermohonanActions";
import EditableFields from "./EditableFields";

type PageProps = { params: Promise<{ id: string }> };

export default async function DetailPermohonanPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role === "user") redirect("/esurat/dashboard");

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
      backHref="/esurat/dashboard/permohonan"
      backLabel="Kembali ke Permohonan"
      showRequester
      fieldsSlot={
        surat.status === "DIAJUKAN" ? (
          <EditableFields
            requestId={surat.id}
            letterTypeCode={surat.letterType.code}
            fields={surat.letterType.requiredFields}
            initialData={surat.data}
            initialPurpose={surat.purpose}
          />
        ) : undefined
      }
    >
      <PermohonanActions id={surat.id} status={surat.status} role={session.role} positionCategory={session.positionCategory} />
    </LetterDetailCard>
  );
}
