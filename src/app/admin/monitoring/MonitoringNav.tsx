"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Navigasi hub Monitoring. Terpisah dari sidebar CMS — hanya menu pengawasan.
const ITEMS = [
  { href: "/admin/monitoring", label: "Dashboard", exact: true },
  { href: "/admin/monitoring/audit", label: "Log Audit", exact: false },
  { href: "/admin/monitoring/infrastruktur", label: "Infrastruktur", exact: false },
  { href: "/admin/monitoring/pengaturan", label: "Kelola Akun", exact: false },
];

export default function MonitoringNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-l-4 px-4 py-2.5 text-sm transition-colors ${
              active
                ? "border-[#eebf6b] bg-white/10 font-semibold text-[#ffdea8]"
                : "border-transparent text-paper/60 hover:bg-white/5 hover:text-paper"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
