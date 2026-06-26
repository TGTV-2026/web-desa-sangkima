"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "./nav";

// Sidebar navigasi CMS; menyorot menu aktif berdasarkan path.
export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => {
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
