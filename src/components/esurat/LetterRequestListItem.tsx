import Link from "next/link";
import StatusBadge from "@/components/esurat/StatusBadge";
import type { LetterStatus } from "@/server/types/letter";

export interface LetterRequestListItemProps {
  href: string;
  title: string;
  subtitle: React.ReactNode;
  status: LetterStatus;
  /** Varian ringkas dipakai di daftar terbaru beranda dashboard. */
  compact?: boolean;
}

/** Satu baris ringkasan permohonan surat yang tertaut ke halaman detail. */
export default function LetterRequestListItem({
  href,
  title,
  subtitle,
  status,
  compact,
}: LetterRequestListItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center justify-between gap-4 py-4 hover:bg-paper2/40 transition-colors ${
          compact ? "px-4 sm:px-6" : "px-6"
        }`}
      >
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold truncate ${
              compact
                ? "text-xs sm:text-sm text-ink hover:text-pine-900 transition-colors"
                : "text-sm"
            }`}
          >
            {title}
          </p>
          {subtitle}
        </div>
        <div className={compact ? "shrink-0 scale-90 sm:scale-100" : "shrink-0"}>
          <StatusBadge status={status} />
        </div>
      </Link>
    </li>
  );
}
