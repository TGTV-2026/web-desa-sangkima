import Link from "next/link";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { CMS_ROLE_LABELS } from "@/server/types/cmsUser";
import AdminNav from "./AdminNav";
import AdminLogout from "./AdminLogout";
import TourButton from "./TourButton";
import CmsTour from "./CmsTour";

// Shell + guard untuk seluruh halaman CMS. Belum login → requireCmsUser
// mengalihkan ke /admin/login.
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
                {CMS_ROLE_LABELS[user.role]}
              </div>
            </div>
            <TourButton />
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
          <AdminNav role={user.role} />
          <Link
            href="/"
            target="_blank"
            data-tour="view-site"
            className="mt-6 block text-[11px] text-inkmut hover:text-pine-900"
          >
            Lihat situs publik ↗
          </Link>
        </aside>

        {/* Konten */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Tur berpandu untuk operator (auto saat pertama, ulang via tombol Panduan) */}
      <CmsTour />
    </div>
  );
}
