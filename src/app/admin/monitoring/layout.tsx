import Link from "next/link";
import type { Metadata } from "next";
import { requireMonitoringUser } from "@/server/utils/cmsSession";
import { CMS_ROLE_LABELS } from "@/server/types/cmsUser";
import { logoutCms } from "../login/actions";
import MonitoringNav from "./MonitoringNav";

export const metadata: Metadata = {
  title: "Monitoring Sistem — Desa Sangkima",
  robots: { index: false, follow: false },
};

// Shell hub Monitoring — BERDIRI SENDIRI, di luar route group (panel) sehingga
// tidak mewarisi sidebar/chrome CMS. Guard requireMonitoringUser: hanya akun
// pengawas & super_admin. Estetika "ledger" (sidebar hijau-tua, aksen kuningan)
// mengikuti desain, memakai token warna proyek (pine/brass).
export default async function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireMonitoringUser();

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 flex h-full w-64 flex-col bg-pine-950 text-paper">
        <div className="border-b border-white/10 p-5">
          <h1 className="font-serif text-xl text-[#ffdea8]">Sangkima Ledger</h1>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-paper/50">
            Pengawasan Sistem
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-5">
          <MonitoringNav />
        </div>

        <div className="flex flex-col gap-1 border-t border-white/10 p-4">
          {/* super_admin bisa balik ke CMS; akun pengawas tidak punya akses CMS */}
          {user.role === "super_admin" && (
            <Link
              href="/admin"
              className="px-4 py-2 text-sm text-paper/60 transition-colors hover:text-paper"
            >
              ← Kembali ke CMS
            </Link>
          )}
          <form action={logoutCms}>
            <button
              type="submit"
              className="w-full px-4 py-2 text-left text-sm text-paper/60 transition-colors hover:text-paper"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Area utama */}
      <div className="ml-64 flex min-h-screen flex-col">
        {/* Bar atas */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-paper/95 px-8 backdrop-blur">
          <span className="font-serif text-lg font-medium text-pine-900">
            Admin Control
          </span>
          <div className="text-right">
            <div className="text-sm font-semibold text-ink">{user.name}</div>
            <div className="text-[11px] uppercase tracking-[0.15em] text-inkmut">
              {CMS_ROLE_LABELS[user.role]}
            </div>
          </div>
        </header>

        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
