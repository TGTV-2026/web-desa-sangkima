"use client";

import type { ReactNode } from "react";
import { TOUR_EVENT } from "./CmsTour";

// Pemicu tur panduan yang bisa diberi gaya bebas (dipakai di kartu sambutan).
export default function TourLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))}
      className={className}
    >
      {children}
    </button>
  );
}
