import Link from "next/link";

export interface StatusFilterPillsProps {
  filters: { label: string; href: string; active: boolean }[];
}

/** Baris pil filter status (mis. Semua/Diajukan/Diproses/...) berbasis query-param link. */
export default function StatusFilterPills({ filters }: StatusFilterPillsProps) {
  return (
    <div
      className="flex gap-1.5 mb-6 overflow-x-auto pb-1 rise-in"
      style={{ animationDelay: "60ms" }}
    >
      {filters.map((f) => (
        <Link
          key={f.label}
          href={f.href}
          className={`whitespace-nowrap rounded-[4px] border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            f.active
              ? "bg-pine-900 border-pine-900 text-paper"
              : "bg-card border-line text-inkmut hover:text-ink hover:bg-paper2/50"
          }`}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
