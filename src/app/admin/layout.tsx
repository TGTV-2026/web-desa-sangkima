import type { Metadata } from "next";
import Link from "next/link";
import { requireCmsUser } from "@/server/utils/cmsSession";
import AdminNav from "./AdminNav";
import AdminLogout from "./AdminLogout";

export const metadata: Metadata = {
  title: "CMS — Desa Sangkima",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard: hanya operator (staff) / kepala desa (admin). Tidak ada link menuju
  // sini di mana pun — diakses dengan mengetik /admin lalu lolos guard ini.
  const user = await requireCmsUser();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Bar atas */}
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-medium text-pine-900">
              CMS Desa Sangkima
            </span>
            <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-brass sm:inline">
              Kelola Web Profil
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-ink">{user.name}</div>
              <div className="text-[11px] uppercase tracking-[0.15em] text-inkmut">
                {user.role === "admin" ? "Kepala Desa" : "Operator"}
              </div>
            </div>
            <AdminLogout />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-8 px-5 py-8 md:flex-row">
        {/* Sidebar */}
        <aside className="md:w-60 md:shrink-0">
          <Link
            href="/admin"
            className="mb-4 block text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
          >
            ← Ringkasan
          </Link>
          <AdminNav />
          <Link
            href="/"
            target="_blank"
            className="mt-6 block text-[11px] text-inkmut hover:text-pine-900"
          >
            Lihat situs publik ↗
          </Link>
        </aside>

        {/* Konten */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
