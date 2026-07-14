import Link from "next/link";
import DataTable, { type DataTableColumn } from "@/components/esurat/DataTable";
import ToggleActiveButton from "./ToggleActiveButton";
import DeleteLetterTypeButton from "./DeleteLetterTypeButton";
import type { LetterTypeDTO } from "@/server/types/letter";

export interface LetterTypesTableProps {
  types: LetterTypeDTO[];
}

const columns: DataTableColumn<LetterTypeDTO>[] = [
  { header: "Kode", render: (t) => <span className="font-mono font-medium text-brass">{t.code}</span> },
  {
    header: "Nama",
    render: (t) => <p className="font-semibold">{t.name}</p>,
  },
  {
    header: "Deskripsi",
    render: (t) => (
      <span className="text-inkmut">
        {t.description ? (
          <span className="text-xs leading-relaxed max-w-xs block line-clamp-2" title={t.description}>
            {t.description}
          </span>
        ) : (
          "—"
        )}
      </span>
    ),
  },
  {
    header: "Template",
    render: (t) => (
      <span
        className={`inline-flex items-center border rounded-[3px] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] ${
          t.hasDocxTemplate
            ? "border-brass/50 text-brass bg-brass/[0.06]"
            : "border-line text-inkmut"
        }`}
      >
        {t.hasDocxTemplate ? "DOCX" : "Bawaan"}
      </span>
    ),
  },
  {
    header: "Status",
    render: (t) => (
      <span
        className={`inline-flex items-center border rounded-[3px] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] ${
          t.active
            ? "border-pine-600/50 text-pine-700 bg-pine-600/[0.06]"
            : "border-line text-inkmut"
        }`}
      >
        {t.active ? "Aktif" : "Nonaktif"}
      </span>
    ),
  },
  {
    header: "Aksi",
    hiddenHeader: true,
    align: "right",
    render: (t) => (
      <span className="inline-flex items-center gap-2">
        <Link
          href={`/esurat/dashboard/jenis-surat/${t.id}`}
          className="rounded-[4px] border border-line bg-card px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-inkmut hover:text-ink hover:bg-paper2/50 transition-colors"
        >
          Ubah
        </Link>
        <ToggleActiveButton id={t.id} active={t.active} name={t.name} />
        <DeleteLetterTypeButton id={t.id} name={t.name} />
      </span>
    ),
  },
];

/** Tabel kelola jenis surat (kode, nama, field tambahan, status, toggle aktif). */
export default function LetterTypesTable({ types }: LetterTypesTableProps) {
  return <DataTable columns={columns} rows={types} rowKey={(t) => t.id} />;
}
