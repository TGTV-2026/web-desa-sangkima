"use client";

import { TOUR_EVENT } from "./CmsTour";

// Tombol untuk memutar ulang tur panduan CMS kapan saja.
export default function TourButton() {
  return (
    <button
      type="button"
      data-tour="help"
      onClick={() => window.dispatchEvent(new Event(TOUR_EVENT))}
      className="inline-flex items-center gap-1.5 rounded-[4px] border border-brass/40 bg-brass/5 px-3 py-2 text-[12px] font-semibold text-brass transition-colors hover:bg-brass/10"
      title="Putar ulang tutorial CMS"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7" />
        <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
      </svg>
      Panduan
    </button>
  );
}
