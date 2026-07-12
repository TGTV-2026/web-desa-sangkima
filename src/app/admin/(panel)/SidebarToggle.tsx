"use client";

import { useSidebar } from "./SidebarProvider";

// Tombol di header: hamburger (mobile → buka/tutup drawer) dan tombol lipat
// (desktop → sembunyikan/tampilkan kolom sidebar).
export default function SidebarToggle() {
  const { collapsed, setCollapsed, drawerOpen, setDrawerOpen } = useSidebar();

  const btn =
    "inline-flex h-9 w-9 items-center justify-center rounded-sm border border-line text-pine-900 transition-colors hover:bg-paper2/60";

  return (
    <>
      {/* Mobile: buka/tutup drawer */}
      <button
        type="button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        aria-label={drawerOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={drawerOpen}
        className={`${btn} md:hidden`}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop: lipat/buka kolom sidebar */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
        aria-expanded={!collapsed}
        title={collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
        className={`${btn} hidden md:inline-flex`}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
        </svg>
      </button>
    </>
  );
}
