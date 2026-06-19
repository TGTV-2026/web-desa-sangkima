import Link from "next/link";
import DataTable, { type DataTableColumn } from "@/components/esurat/DataTable";
import { formatTanggal } from "@/lib/format";
import type { UserDTO } from "@/server/types/user";
import DeleteUserButton from "./DeleteUserButton";

export interface PenggunaTableProps {
  users: UserDTO[];
  currentUserId: string;
  canDelete: boolean;
}

const ROLE_CLASSES: Record<UserDTO["role"], string> = {
  admin: "border-pine-800 bg-pine-800 text-paper",
  staff: "border-brass/50 text-brass bg-brass/[0.06]",
  user: "border-line text-inkmut",
};

const ROLE_LABEL: Record<UserDTO["role"], string> = {
  admin: "Admin",
  staff: "Staff",
  user: "Warga",
};

export default function PenggunaTable({ users, currentUserId, canDelete }: PenggunaTableProps) {
  const columns: DataTableColumn<UserDTO>[] = [
    {
      header: "Nama",
      render: (u) => (
        <>
          <p className="font-semibold">{u.name}</p>
          <p className="font-mono text-xs text-inkmut mt-0.5">{u.nik}</p>
        </>
      ),
    },
    { header: "Email", render: (u) => <span className="text-inkmut">{u.email}</span> },
    {
      header: "Role",
      render: (u) => (
        <span
          className={`inline-flex items-center border rounded-[3px] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] ${ROLE_CLASSES[u.role]}`}
        >
          {ROLE_LABEL[u.role]}
        </span>
      ),
    },
    { header: "Jabatan", render: (u) => <span className="text-inkmut">{u.positionName ?? "—"}</span> },
    {
      header: "Terdaftar",
      render: (u) => <span className="text-inkmut">{formatTanggal(u.createdAt?.toISOString())}</span>,
    },
    {
      header: "Aksi",
      hiddenHeader: true,
      align: "right",
      render: (u) => (
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/esurat/dashboard/pengguna/${u.id}`}
            className="text-xs font-semibold text-brass hover:underline underline-offset-2 whitespace-nowrap"
          >
            Edit
          </Link>
          {canDelete && u.id !== currentUserId && <DeleteUserButton id={u.id} name={u.name} />}
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} rows={users} rowKey={(u) => u.id} />;
}
