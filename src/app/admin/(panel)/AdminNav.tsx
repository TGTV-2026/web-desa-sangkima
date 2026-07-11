"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CmsRole } from "@/server/types/cmsUser";
import { navUntukRole } from "./nav";

// Sidebar navigasi CMS; menyorot menu aktif berdasarkan path.
// Menu difilter per peran (akun rt hanya melihat Laporan RT & Akun Saya).
export default function AdminNav({ role }: { role: CmsRole }) {
  const pathname = usePathname();
  const items = navUntukRole(role);
  return (
    <nav className="flex flex-col gap-1" data-tour="nav">
      {items.map((item) => {
        const active = pathname === item.href;
        if (!item.ready) {
          return (
            <span
              key={item.key}
              className="flex items-center justify-between rounded-sm px-3 py-2 text-sm text-inkmut/50"
            >
              {item.label}
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-inkmut/40">
                Segera
              </span>
            </span>
          );
        }
        return (
          <Link
            key={item.key}
            href={item.href}
            data-tour={`nav-${item.key}`}
            className={`rounded-sm px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-pine-900 font-semibold text-paper"
                : "text-ink hover:bg-paper2/60"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
