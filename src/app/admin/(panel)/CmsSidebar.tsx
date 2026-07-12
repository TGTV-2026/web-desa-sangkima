"use client";

import { useSidebar } from "./SidebarProvider";

// Sidebar CMS: kolom statis di desktop (bisa dilipat) dan drawer overlay di
// mobile. Isi menu (Ringkasan, AdminNav, Lihat situs) diteruskan sebagai
// children dari layout (Server Component).
export default function CmsSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed, drawerOpen, setDrawerOpen } = useSidebar();

  const asideClass = [
    // Mobile: drawer overlay yang menggeser dari kiri.
    "fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-line bg-paper p-5 shadow-xl transition-transform duration-300",
    drawerOpen ? "translate-x-0" : "-translate-x-full",
    // Desktop: kolom statis dalam alur; lebar/opacity dianimasikan saat dilipat.
    "md:static md:z-auto md:shrink-0 md:translate-x-0 md:overflow-visible md:border-r-0 md:bg-transparent md:p-0 md:shadow-none md:transition-[width,opacity]",
    collapsed
      ? "md:w-0 md:overflow-hidden md:opacity-0 md:pointer-events-none"
      : "md:w-60 md:opacity-100",
  ].join(" ");

  return (
    <>
      {/* Backdrop hanya di mobile saat drawer terbuka. */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-ink/50 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={asideClass}
        // Klik link di dalam drawer (mobile) → tutup drawer.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setDrawerOpen(false);
        }}
      >
        {/* Tombol tutup khusus mobile (drawer menutupi header). */}
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Tutup menu"
          className="mb-3 ml-auto flex h-8 w-8 items-center justify-center rounded-sm text-inkmut hover:bg-paper2/60 md:hidden"
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
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        {children}
      </aside>
    </>
  );
}
