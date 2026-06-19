export interface DataTableColumn<T> {
  header: string;
  /** Sembunyikan teks header tapi tetap sediakan kolom (mis. kolom aksi). */
  hiddenHeader?: boolean;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

/** Tabel generik (header + body) dengan styling "arsip resmi desa" yang konsisten di seluruh halaman dashboard. */
export default function DataTable<T>({ columns, rows, rowKey }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-inkmut border-b border-line">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-6 py-3.5 ${col.align === "right" ? "text-right" : ""} ${col.hiddenHeader ? "" : "font-semibold"}`}
              >
                {col.hiddenHeader ? null : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-paper2/30 transition-colors">
              {columns.map((col, i) => (
                <td key={i} className={`px-6 py-4 ${col.align === "right" ? "text-right" : ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
