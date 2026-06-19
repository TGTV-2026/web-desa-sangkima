import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import StatusFilterPills from "@/components/esurat/StatusFilterPills";
import EmptyState from "@/components/esurat/EmptyState";
import PermohonanTable from "@/components/esurat/PermohonanTable";
import Pagination from "@/components/esurat/Pagination";
import LimitSelect from "@/components/esurat/LimitSelect";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import {
  LETTER_STATUSES,
  LETTER_STATUS_META,
  type LetterStatus,
} from "@/server/types/letter";

type PageProps = { searchParams: Promise<{ status?: string; page?: string; limit?: string }> };

export default async function PermohonanPage({ searchParams }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role === "user") redirect("/esurat/dashboard");

  const { status: statusParam, page: pageParam, limit: limitParam } = await searchParams;
  const status = LETTER_STATUSES.includes(statusParam as LetterStatus)
    ? (statusParam as LetterStatus)
    : undefined;
  const page = Math.max(1, Number(pageParam) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitParam) || 10));

  const { data: requests, pagination } = await letterRequestService.listAllPaginated(
    status,
    page,
    limit,
  );

  const filters: { label: string; href: string; active: boolean }[] = [
    { label: "Semua", href: `/esurat/dashboard/permohonan?limit=${limit}`, active: !status },
    ...LETTER_STATUSES.map((s) => ({
      label: LETTER_STATUS_META[s].label,
      href: `/esurat/dashboard/permohonan?status=${s}&limit=${limit}`,
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

      <div className="flex items-start justify-between gap-3">
        <StatusFilterPills filters={filters} />
      </div>

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
      <div className="flex items-center justify-between gap-3 rise-in" style={{ animationDelay: "180ms" }}>
        <LimitSelect value={limit} />
        <Pagination
          pagination={pagination}
          makeHref={(p) =>
            `/esurat/dashboard/permohonan?${new URLSearchParams({
              ...(status ? { status } : {}),
              limit: String(limit),
              page: String(p),
            })}`
          }
        />
      </div>
    </div>
  );
}
