import Link from "next/link";
import DataTable, { type DataTableColumn } from "@/components/esurat/DataTable";
import StatusBadge from "@/components/esurat/StatusBadge";
import { formatTanggal } from "@/lib/format";
import type { LetterRequestDTO } from "@/server/types/letter";

type Row = Pick<LetterRequestDTO, "id" | "requester" | "letterType" | "status" | "createdAt">;

export interface PermohonanTableProps {
  requests: Row[];
}

const columns: DataTableColumn<Row>[] = [
  {
    header: "Pemohon",
    render: (r) => (
      <>
        <p className="font-semibold">{r.requester.name}</p>
        <p className="font-mono text-xs text-inkmut mt-0.5">{r.requester.nik}</p>
      </>
    ),
  },
  { header: "Jenis Surat", render: (r) => <span className="font-medium">{r.letterType.name}</span> },
  { header: "Tanggal", render: (r) => <span className="text-inkmut">{formatTanggal(r.createdAt)}</span> },
  { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  {
    header: "Aksi",
    hiddenHeader: true,
    align: "right",
    render: (r) => (
      <Link
        href={`/esurat/dashboard/permohonan/${r.id}`}
        className="text-xs font-semibold text-brass hover:underline underline-offset-2 whitespace-nowrap"
      >
        Periksa →
      </Link>
    ),
  },
];

/** Tabel daftar permohonan surat untuk petugas/admin, tertaut ke halaman detail. */
export default function PermohonanTable({ requests }: PermohonanTableProps) {
  return <DataTable columns={columns} rows={requests} rowKey={(r) => r.id} />;
}
