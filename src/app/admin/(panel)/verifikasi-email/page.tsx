import Link from "next/link";
import { redirect } from "next/navigation";
import { requireCmsUser } from "@/server/utils/cmsSession";
import VerifikasiEmailForm from "./VerifikasiEmailForm";

export const dynamic = "force-dynamic";

export default async function VerifikasiEmailPage() {
  const me = await requireCmsUser();
  // Sudah terverifikasi → tak ada yang perlu dikerjakan di sini.
  if (me.emailVerified) redirect("/admin");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Ringkasan
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-pine-900">
          Aktifkan Akun
        </h1>
        <p className="mt-1 text-sm text-inkmut">
          Satu langkah lagi sebelum Anda bisa mengelola konten website.
        </p>
      </div>

      <VerifikasiEmailForm email={me.email} />
    </div>
  );
}
