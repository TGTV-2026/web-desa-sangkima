import Link from "next/link";
import { CMS_ROLE_LABELS } from "@/server/types/cmsUser";
import { requireCmsUser } from "@/server/utils/cmsSession";
import AkunForms from "./AkunForms";

export const dynamic = "force-dynamic";

export default async function AkunSayaPage() {
  const me = await requireCmsUser();

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
          Akun Saya
        </h1>
        <p className="mt-1 text-sm text-inkmut">
          {me.name} · {CMS_ROLE_LABELS[me.role]}
        </p>
      </div>

      <AkunForms currentEmail={me.email} />
    </div>
  );
}
