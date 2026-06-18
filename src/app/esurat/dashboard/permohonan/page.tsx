import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import StatusFilterPills from "@/components/esurat/StatusFilterPills";
import EmptyState from "@/components/esurat/EmptyState";
import PermohonanTable from "@/components/esurat/PermohonanTable";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import {
  LETTER_STATUSES,
  LETTER_STATUS_META,
  type LetterStatus,
} from "@/server/types/letter";

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function PermohonanPage({ searchParams }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role === "user") redirect("/esurat/dashboard");

  const { status: statusParam } = await searchParams;
  const status = LETTER_STATUSES.includes(statusParam as LetterStatus)
    ? (statusParam as LetterStatus)
    : undefined;

  const requests = await letterRequestService.listAll(status);

  const filters: { label: string; href: string; active: boolean }[] = [
    { label: "Semua", href: "/esurat/dashboard/permohonan", active: !status },
    ...LETTER_STATUSES.map((s) => ({
      label: LETTER_STATUS_META[s].label,
      href: `/esurat/dashboard/permohonan?status=${s}`,
      active: status === s,
    })),
  ];

  return (
    <div>
      <PageHeader
        overline="Buku Agenda"
        title="Permohonan Surat"
        description="Kelola pengajuan surat dari warga."
      />

      <StatusFilterPills filters={filters} />

      <div className="card-doc overflow-hidden rise-in" style={{ animationDelay: "120ms" }}>
        {requests.length === 0 ? (
          <EmptyState
            title="Tidak ada permohonan"
            description={
              status
                ? `Belum ada surat berstatus ${LETTER_STATUS_META[status].label}.`
                : "Permohonan dari warga akan tampil di sini."
            }
          />
        ) : (
          <PermohonanTable requests={requests} />
        )}
      </div>
    </div>
  );
}
