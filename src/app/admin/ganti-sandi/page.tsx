import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCmsUser } from "@/server/utils/cmsSession";
import GantiSandiForm from "./GantiSandiForm";

export const metadata: Metadata = {
  title: "Ganti Kata Sandi — CMS Desa Sangkima",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Halaman wajib untuk akun bersandi sementara (hasil bulk-CSV). Di luar
// (panel) agar tidak kena redirect layout — layout panel justru mengarahkan
// ke sini selama mustChangePassword masih true.
export default async function GantiSandiPage() {
  const user = await requireCmsUser();
  // Sandi sudah milik sendiri → tak ada alasan ke halaman ini.
  if (!user.mustChangePassword) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Kelola Web Profil
          </span>
          <h1 className="mt-1 font-serif text-3xl font-medium text-pine-900">
            Ganti Kata Sandi
          </h1>
          <p className="mt-2 text-sm text-inkmut">
            Halo, <span className="font-semibold text-ink">{user.name}</span>.
            Sandi Anda masih sandi sementara dari admin desa — buat sandi baru
            milik Anda sendiri sebelum melanjutkan.
          </p>
        </div>
        <div className="card-doc p-6">
          <GantiSandiForm />
        </div>
      </div>
    </main>
  );
}
