import Link from "next/link";
import { requireSuperAdmin } from "@/server/utils/cmsSession";
import MonitoringNav from "./MonitoringNav";

// Monitoring Hub — surface operasional tersendiri (tema gelap, acuan desain
// Stitch), terpisah dari panel CMS konten. Guard: super_admin saja.
export const dynamic = "force-dynamic";

export default async function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperAdmin();

  return (
    <div className="flex min-h-screen bg-[#0e1217] text-[#e0e2ea]">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[#24323d] bg-[#101419] p-5 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#006c49]/25 text-[#10b981]">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h4l3 8 4-16 3 8h4" />
            </svg>
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[#e0e2ea]">Monitoring Hub</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-[#6b7b88]">
              Desa Sangkima
            </div>
          </div>
        </div>

        <MonitoringNav />

        <Link
          href="/admin"
          className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-xs text-[#6b7b88] transition-colors hover:text-[#e0e2ea]"
        >
          ← Kembali ke CMS
        </Link>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#24323d] bg-[#101419]/95 px-6 py-3 backdrop-blur">
          <span className="text-sm font-semibold text-[#e0e2ea] md:hidden">
            Monitoring Hub
          </span>
          <span className="hidden text-xs uppercase tracking-[0.16em] text-[#6b7b88] md:inline">
            Sangkima Monitoring Hub
          </span>
          <div className="text-right">
            <div className="text-sm font-semibold text-[#e0e2ea]">{user.name}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-[#6b7b88]">
              Super Admin
            </div>
          </div>
        </header>

        {/* Nav mobile ringkas */}
        <div className="border-b border-[#24323d] bg-[#101419] px-4 py-2 md:hidden">
          <MonitoringNav />
        </div>

        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
