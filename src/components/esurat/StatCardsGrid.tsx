export type StatCardAccent = "ink" | "brass" | "pine" | "oxide";

export interface StatCardData {
  label: string;
  value: string | number;
  accent: StatCardAccent;
}

export interface StatCardsGridProps {
  cards: StatCardData[];
}

const ACCENT_CLASSES: Record<StatCardAccent, string> = {
  ink: "bg-ink/30",
  brass: "bg-brass",
  pine: "bg-pine-600",
  oxide: "bg-oxide",
};

/** Grid kartu statistik ringkas di beranda dashboard E-Surat. */
export default function StatCardsGrid({ cards }: StatCardsGridProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-8 sm:mb-10 rise-in"
      style={{ animationDelay: "80ms" }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          className="card-doc p-4 sm:p-5 lg:p-6 bg-paper border border-line/60 rounded-sm shadow-sm hover:border-line transition-all group relative overflow-hidden"
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${ACCENT_CLASSES[c.accent]} opacity-70`} />
          <div className="flex justify-between items-baseline pl-1">
            <p className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tabular-nums tracking-tight text-ink group-hover:text-pine-900 transition-colors">
              {c.value}
            </p>
          </div>
          <p className="text-[9px] sm:text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] text-inkmut mt-3 sm:mt-4 pl-1 truncate">
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}
