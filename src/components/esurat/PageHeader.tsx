export interface PageHeaderProps {
  /** Mode breadcrumb dua-segmen (mis. "Layanan Surat / Formulir Permohonan"). */
  breadcrumb?: { parent: string; current: string };
  /** Mode overline satu-baris (mis. "Pengaturan Layanan"). Pakai salah satu: breadcrumb atau overline. */
  overline?: string;
  title: string;
  description?: string;
  descriptionClassName?: string;
  action?: React.ReactNode;
  bordered?: boolean;
}

/** Header halaman (label + judul + deskripsi + slot aksi) dipakai di seluruh halaman dashboard E-Surat. */
export default function PageHeader({
  breadcrumb,
  overline,
  title,
  description,
  descriptionClassName,
  action,
  bordered,
}: PageHeaderProps) {
  return (
    <div
      className={`rise-in ${action ? "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5" : ""} ${bordered ? "border-b border-line py-4 md:py-5" : ""}`}
    >
      <div className="min-w-0 flex-1">
        {breadcrumb ? (
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-inkmut">
            <span>{breadcrumb.parent}</span>
            <span className="text-line">/</span>
            <span className="text-brass">{breadcrumb.current}</span>
          </div>
        ) : (
          <p className="overline-doc">{overline}</p>
        )}

        <h1
          className={
            breadcrumb
              ? "font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight mt-1.5 text-pine-900 truncate"
              : "font-serif text-4xl font-medium tracking-tight mt-1.5"
          }
        >
          {title}
        </h1>

        {description && (
          <p className={`text-sm text-inkmut mt-1.5 ${descriptionClassName ?? ""}`}>
            {description}
          </p>
        )}
      </div>

      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </div>
  );
}
