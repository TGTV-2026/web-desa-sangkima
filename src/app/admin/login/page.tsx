import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCmsUser } from "@/server/utils/cmsSession";
import CmsLoginForm from "./CmsLoginForm";

export const metadata: Metadata = {
  title: "Masuk CMS — Desa Sangkima",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CmsLoginPage() {
  // Sudah login → langsung ke dasbor.
  if (await getCmsUser()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Kelola Web Profil
          </span>
          <h1 className="mt-1 font-serif text-3xl font-medium text-pine-900">
            CMS Desa Sangkima
          </h1>
          <p className="mt-2 text-sm text-inkmut">
            Masuk dengan akun editor yang dibuat oleh Super Admin.
          </p>
        </div>
        <div className="card-doc p-6">
          <CmsLoginForm />
        </div>
        <p className="mt-6 text-center text-[11px] text-inkmut">
          Akun ini terpisah dari akun layanan e-surat warga.
        </p>
      </div>
    </main>
  );
}
