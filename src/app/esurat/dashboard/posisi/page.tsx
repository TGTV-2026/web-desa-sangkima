import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import EmptyState from "@/components/esurat/EmptyState";
import Pagination from "@/components/esurat/Pagination";
import LimitSelect from "@/components/esurat/LimitSelect";
import { getSessionUser } from "@/server/utils/session";
import { positionService } from "@/server/services/position.service";
import PosisiTable from "./PosisiTable";

type PageProps = { searchParams: Promise<{ q?: string; page?: string; limit?: string }> };

export default async function PosisiPage({ searchParams }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "admin") redirect("/esurat/dashboard");

  const { q, page: pageParam, limit: limitParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitParam) || 10));

  const { data: positions, pagination } = await positionService.listPaginated(page, limit, q);

  return (
    <div>
      <PageHeader
        overline="Pengaturan Layanan"
        title="Jabatan"
        description="Kelola daftar jabatan/posisi yang dapat ditetapkan pada pengguna."
        action={
          <Link href="/esurat/dashboard/posisi/tambah" className="btn-primary">
            + Tambah Jabatan
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-3 mb-6 rise-in" style={{ animationDelay: "60ms" }}>
        <form method="GET">
          <input type="hidden" name="limit" value={limit} />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cari nama atau kategori jabatan..."
            className="input-doc max-w-sm"
          />
        </form>
      </div>

      <div className="card-doc overflow-hidden rise-in" style={{ animationDelay: "120ms" }}>
        {positions.length === 0 ? (
          <EmptyState
            title="Tidak ada jabatan"
            description={
              q ? `Tidak ditemukan jabatan untuk "${q}".` : "Belum ada jabatan terdaftar."
            }
          />
        ) : (
          <PosisiTable positions={positions} />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 rise-in" style={{ animationDelay: "180ms" }}>
        <LimitSelect value={limit} />
        <Pagination
          pagination={pagination}
          makeHref={(p) =>
            `/esurat/dashboard/posisi?${new URLSearchParams({
              ...(q ? { q } : {}),
              limit: String(limit),
              page: String(p),
            })}`
          }
        />
      </div>
    </div>
  );
}
