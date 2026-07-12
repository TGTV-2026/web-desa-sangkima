"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/admin/monitoring",
    label: "Overview",
    d: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z",
  },
  {
    href: "/admin/monitoring/audit",
    label: "Audit Logs",
    d: "M4 6h16M4 12h16M4 18h10",
  },
  {
    href: "/admin/monitoring/infrastruktur",
    label: "Infrastructure",
    d: "M4 5h16v6H4V5Zm0 8h16v6H4v-6Zm3-5h.01M7 16h.01",
  },
];

export default function MonitoringNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((it) => {
        const active =
          it.href === "/admin/monitoring"
            ? pathname === it.href
            : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[#006c49]/20 font-semibold text-[#10b981]"
                : "text-[#9fb0bd] hover:bg-[#1c2a34] hover:text-[#e0e2ea]"
            }`}
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
              <path d={it.d} />
            </svg>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
