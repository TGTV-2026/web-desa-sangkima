import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/esurat/PageHeader";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import { userService } from "@/server/services/user.service";
import {
  isProfileComplete,
  getMissingProfileFields,
} from "@/server/types/user";
import AjukanForm from "../AjukanForm";
import ProfileIncompleteBlocker from "../ProfileIncompleteBlocker";

type PageProps = { params: Promise<{ typeId: string }> };

export default async function AjukanFormPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  const user = await userService.getById(session.id);
  const profileComplete = isProfileComplete(user);

  const { typeId } = await params;
  let type;
  try {
    type = await letterTypeService.getById(typeId);
  } catch {
    notFound();
  }
  if (!type.active) notFound();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-2 py-6 sm:py-10 min-h-screen text-ink select-none antialiased">
      <PageHeader
        breadcrumb={{ parent: "Layanan Surat", current: type.name }}
        title="Ajukan Surat Resmi"
        description={
          profileComplete
            ? "Lengkapi kolom instrumen data yang diminta. Parameter data identitas primer Anda akan disinkronisasikan otomatis oleh sistem berdasarkan rekam profil kependudukan desa."
            : "Sebelum mengajukan surat, Anda perlu melengkapi data profil kependudukan terlebih dahulu."
        }
        action={
          <Link
            href="/esurat/dashboard/ajukan"
            className="text-xs font-semibold text-brass hover:underline underline-offset-2"
          >
            ← Pilih jenis surat lain
          </Link>
        }
        bordered
      />

      <div className="rise-in" style={{ animationDelay: "100ms" }}>
        {profileComplete ? (
          <AjukanForm type={type} />
        ) : (
          <ProfileIncompleteBlocker
            missingFields={getMissingProfileFields(user)}
          />
        )}
      </div>
    </div>
  );
}
