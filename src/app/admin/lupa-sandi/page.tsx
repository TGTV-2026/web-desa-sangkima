import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCmsUser } from "@/server/utils/cmsSession";
import LupaSandiForm from "./LupaSandiForm";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi — CMS Desa Sangkima",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LupaSandiPage() {
  // Sudah login → tak perlu reset, arahkan ke halaman akun.
  if (await getCmsUser()) redirect("/admin/akun");

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Kelola Web Profil
          </span>
          <h1 className="mt-1 font-serif text-3xl font-medium text-pine-900">
            Lupa Kata Sandi
          </h1>
          <p className="mt-2 text-sm text-inkmut">
            Masukkan email akun CMS Anda. Kami kirim kode OTP untuk mengatur
            ulang kata sandi.
          </p>
        </div>
        <div className="card-doc p-6">
          <LupaSandiForm />
        </div>
        <p className="mt-6 text-center text-[11px] text-inkmut">
          Ingat kata sandi Anda?{" "}
          <Link href="/admin/login" className="font-semibold text-brass hover:underline">
            Kembali ke halaman masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
