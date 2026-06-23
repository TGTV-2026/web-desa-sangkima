"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Role = "user" | "staff" | "admin";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const ICONS = {
  home: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-[18px] h-[18px]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  plus: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-[18px] h-[18px]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="13" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  ),
  doc: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-[18px] h-[18px]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  ),
  inbox: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-[18px] h-[18px]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </svg>
  ),
  tag: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-[18px] h-[18px]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M20.6 13.4 12 22l-8.6-8.6a2 2 0 0 1-.6-1.4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 1.4.6L22 10.4a2 2 0 0 1 0 2.8z"
        transform="rotate(90 12 12)"
      />
      <circle cx="9" cy="9" r="1.5" />
    </svg>
  ),
  user: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-[18px] h-[18px]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  logout: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-[18px] h-[18px]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  ),
  badge: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="w-[18px] h-[18px]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  ),
};

const ROLE_LABEL: Record<Role, string> = {
  user: "Warga",
  staff: "Operator Desa",
  admin: "Admin",
};

function navForRole(role: Role): NavItem[] {
  const items: NavItem[] = [
    { href: "/esurat/dashboard", label: "Beranda", icon: ICONS.home },
  ];
  if (role === "user") {
    items.push(
      {
        href: "/esurat/dashboard/ajukan",
        label: "Ajukan Surat",
        icon: ICONS.plus,
      },
      { href: "/esurat/dashboard/surat", label: "Surat Saya", icon: ICONS.doc },
      {
        href: "/esurat/dashboard/profil",
        label: "Profil Saya",
        icon: ICONS.user,
      },
    );
  }
  if (role === "staff") {
    items.push(
      {
        href: "/esurat/dashboard/permohonan",
        label: "Permohonan",
        icon: ICONS.inbox,
      },
      {
        href: "/esurat/dashboard/pengguna",
        label: "Pengguna",
        icon: ICONS.user,
      },
    );
  }
  if (role === "admin") {
    items.push(
      {
        href: "/esurat/dashboard/permohonan",
        label: "Permohonan",
        icon: ICONS.inbox,
      },
      {
        href: "/esurat/dashboard/jenis-surat",
        label: "Jenis Surat",
        icon: ICONS.tag,
      },
      {
        href: "/esurat/dashboard/posisi",
        label: "Jabatan",
        icon: ICONS.badge,
      },
      {
        href: "/esurat/dashboard/pengguna",
        label: "Pengguna",
        icon: ICONS.user,
      },
    );
  }
  return items;
}

export default function Sidebar({ role, name, positionName }: { role: Role; name: string; positionName?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navForRole(role);

  // Tutup menu mobile saat navigasi berpindah halaman
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Kunci scroll body saat menu mobile terbuka
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/esurat/dashboard"
      ? pathname === href
      : pathname.startsWith(href);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/esurat/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <>
      {/* ===== Mobile top bar ===== */}
      <header className="md:hidden bg-pine-900 text-paper sticky top-0 z-40 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full border border-paper/40 grid place-items-center shrink-0">
            <div className="absolute inset-[3px] rounded-full border border-paper/20" />
            <span className="font-serif font-semibold text-[11px]">DS</span>
          </div>
          <div className="min-w-0">
            <p className="font-serif text-[20px] leading-tight">E-Surat</p>
            <p className="text-[9px] uppercase tracking-[0.16em] text-paper/45 leading-tight">
              Desa Sangkima
            </p>
          </div>
        </div>

        {/* Hamburger / close button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          /* PERUBAHAN: Menambahkan class '-mr-2' agar bergeser sedikit ke kanan pas dengan grid */
          className="relative w-9 h-9 grid place-items-center rounded-[4px] hover:bg-paper/10 transition-colors -mr-2"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
        >
          <span className="sr-only">{mobileOpen ? "Tutup" : "Menu"}</span>
          {/* 3 garis yang ber-animasi menjadi X */}
          <span className="block w-5 h-5 relative">
            <span
              className={`absolute left-0 h-[2px] w-full bg-paper rounded-full transition-all duration-300 ${
                mobileOpen ? "top-[9px] rotate-45" : "top-[3px] rotate-0"
              }`}
            />
            <span
              className={`absolute left-0 top-[9px] h-[2px] w-full bg-paper rounded-full transition-all duration-300 ${
                mobileOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
              }`}
            />
            <span
              className={`absolute left-0 h-[2px] w-full bg-paper rounded-full transition-all duration-300 ${
                mobileOpen ? "top-[9px] -rotate-45" : "top-[15px] rotate-0"
              }`}
            />
          </span>
        </button>
      </header>

      {/* ===== Mobile overlay menu ===== */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-ink/40 z-30 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      {/* Panel navigasi */}
      <div
        className={`md:hidden fixed top-[52px] left-0 right-0 bg-pine-900 text-paper z-35 shadow-lg transition-all duration-300 origin-top ${
          mobileOpen
            ? "opacity-100 translate-y-0 scale-y-100"
            : "opacity-0 -translate-y-2 scale-y-95 pointer-events-none"
        }`}
        style={{ maxHeight: "calc(100dvh - 52px)", overflowY: "auto" }}
      >
        <nav className="flex flex-col gap-0.5 px-4 pt-3 pb-2">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-[4px] px-3.5 py-3 text-[14px] font-semibold transition-colors ${
                  active
                    ? "bg-paper/10 text-paper"
                    : "text-paper/55 hover:text-paper hover:bg-paper/5"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-brass rounded-r" />
                )}
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 border-t border-paper/10" />

        {/* Info pengguna + logout */}
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{name}</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-brass mt-0.5">
              {ROLE_LABEL[role]}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-[4px] px-3 py-2 text-[14px] font-semibold text-paper/50 hover:text-paper transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {ICONS.logout}
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </div>

      {/* ===== Desktop sidebar (tidak berubah) ===== */}
      <aside className="hidden md:flex bg-pine-900 text-paper w-64 h-screen flex-col sticky top-0 shrink-0 z-30">

        {/* Identitas */}
        <div className="flex items-center gap-3 px-6 pt-7 pb-6 shrink-0">
          <div className="relative w-10 h-10 rounded-full border border-paper/40 grid place-items-center shrink-0">
            <div className="absolute inset-[4px] rounded-full border border-paper/20" />
            <span className="font-serif font-semibold text-sm">DS</span>
          </div>
          <div className="min-w-0">
            <p className="font-serif text-lg font-medium leading-tight">
              E-Surat
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-paper/45 leading-tight">
              Desa Sangkima
            </p>
          </div>
        </div>

        <div className="mx-6 border-t border-paper/10 shrink-0" />

        {/* Navigasi */}
        <nav className="flex flex-col flex-1 items-stretch gap-0.5 px-4 py-4 overflow-y-auto custom-scrollbar">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-[4px] px-3.5 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-paper/10 text-paper"
                    : "text-paper/55 hover:text-paper hover:bg-paper/5"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-brass rounded-r" />
                )}
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Pengguna */}
        <div className="flex flex-col items-stretch gap-2 px-6 py-6 border-t border-paper/10 mt-auto shrink-0 bg-pine-900">
          <div className="pb-1">
            <p className="text-sm font-semibold truncate">{name}</p>
            {role !== "user" && (
              <p className="text-[10px] uppercase tracking-[0.16em] text-brass mt-0.5">
                {role === "admin" ? ROLE_LABEL["admin"] : (positionName || ROLE_LABEL["staff"])}
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2.5 rounded-[4px] -mx-2 px-2 py-2 text-[14px] font-semibold text-paper/50 hover:text-paper transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {ICONS.logout}
            {loggingOut ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </aside>
    </>
  );
}
