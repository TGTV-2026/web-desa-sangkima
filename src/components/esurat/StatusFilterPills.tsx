import Link from "next/link";

export interface StatusFilterPillsProps {
  filters: { label: string; href: string; active: boolean }[];
}

export default function StatusFilterPills({ filters }: StatusFilterPillsProps) {
  return (
    <div
      className="flex gap-2 sm:gap-3 md:gap-5 mb-4 sm:mb-5 overflow-x-auto touch-pan-x rise-in"
      style={{ animationDelay: "60ms" }}
    >
      {filters.map((f) => (
        <Link
          key={f.label}
          href={f.href}
          className={`shrink-0 whitespace-nowrap rounded-[4px] border px-3 py-1.5 sm:px-3.5 text-[14px] font-semibold transition-colors ${
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