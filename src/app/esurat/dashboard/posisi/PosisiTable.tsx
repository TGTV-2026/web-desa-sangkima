import Link from "next/link";
import DataTable, { type DataTableColumn } from "@/components/esurat/DataTable";
import { formatTanggal } from "@/lib/format";
import type { PositionDTO } from "@/server/types/position";
import DeletePosisiButton from "./DeletePosisiButton";

export interface PosisiTableProps {
  positions: PositionDTO[];
}

const columns: DataTableColumn<PositionDTO>[] = [
  { header: "Kategori", render: (p) => <span className="font-mono font-medium text-brass">{p.category}</span> },
  { header: "Nama Jabatan", render: (p) => <span className="font-semibold">{p.name}</span> },
  { header: "Dibuat", render: (p) => <span className="text-inkmut">{formatTanggal(p.createdAt.toISOString())}</span> },
  {
    header: "Aksi",
    hiddenHeader: true,
    align: "right",
    render: (p) => (
      <div className="flex items-center justify-end gap-3">
        <Link
          href={`/esurat/dashboard/posisi/${p.id}`}
          className="text-xs font-semibold text-brass hover:underline underline-offset-2 whitespace-nowrap"
        >
          Edit
        </Link>
        <DeletePosisiButton id={p.id} name={p.name} />
      </div>
    ),
  },
];

/** Tabel kelola jabatan/posisi (kategori, nama, aksi edit/hapus). */
export default function PosisiTable({ positions }: PosisiTableProps) {
  return <DataTable columns={columns} rows={positions} rowKey={(p) => p.id} />;
}
