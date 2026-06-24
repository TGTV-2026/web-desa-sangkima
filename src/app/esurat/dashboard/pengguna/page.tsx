import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import EmptyState from "@/components/esurat/EmptyState";
import Pagination from "@/components/esurat/Pagination";
import LimitSelect from "@/components/esurat/LimitSelect";
import { getSessionUser } from "@/server/utils/session";
import { userService } from "@/server/services/user.service";
import PenggunaTable from "./PenggunaTable";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string; limit?: string }>;
};

export default async function PenggunaPage({ searchParams }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "staff" && session.role !== "admin")
    redirect("/esurat/dashboard");
  const isStaff = session.role === "staff";

  const { q, page: pageParam, limit: limitParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitParam) || 10));

  const { data: users, pagination } = await userService.list(
    page,
    limit,
    q,
    isStaff ? "user" : undefined,
  );

  return (
    <div>
      <PageHeader
        breadcrumb={{ parent: "Layanan Administrasi", current: "Pengguna" }}
        title="Pengguna"
        description={
          isStaff
            ? "Kelola akun warga."
            : "Kelola akun warga, staff, dan admin."
        }
        action={
          <Link
            href="/esurat/dashboard/pengguna/tambah"
            className="btn-primary"
          >
            + Tambah Pengguna
          </Link>
        }
        bordered
      />

      <div
        className="w-full mb-5 mt-5 rise-in"
        style={{ animationDelay: "60ms" }}
      >
        <form method="GET" className="flex items-center gap-5 w-full">
          <input type="hidden" name="limit" value={limit} />

          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cari nama, email, atau NIK..."
            className="input-doc py-2 w-7/8"
          />

          <button
            type="submit"
            className="btn-primary py-2 w-1/8 flex items-center justify-center whitespace-nowrap"
          >
            Cari
          </button>
        </form>
      </div>

      <div
        className="card-doc overflow-hidden rise-in"
        style={{ animationDelay: "120ms" }}
      >
        {users.length === 0 ? (
          <EmptyState
            title="Tidak ada pengguna"
            description={
              q
                ? `Tidak ditemukan pengguna untuk "${q}".`
                : "Belum ada pengguna terdaftar."
            }
          />
        ) : (
          <PenggunaTable
            users={users}
            currentUserId={session.id}
            canDelete={!isStaff}
          />
        )}
      </div>
      <div
        className="flex items-center justify-between gap-3 rise-in mt-5"
        style={{ animationDelay: "180ms" }}
      >
        <LimitSelect value={limit} />
        <Pagination
          pagination={pagination}
          makeHref={(p) =>
            `/esurat/dashboard/pengguna?${new URLSearchParams({
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
