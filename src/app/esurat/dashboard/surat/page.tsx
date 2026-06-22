import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/esurat/PageHeader";
import EmptyState from "@/components/esurat/EmptyState";
import LetterRequestListItem from "@/components/esurat/LetterRequestListItem";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { formatTanggal } from "@/lib/format";

export default async function SuratSayaPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  const requests = await letterRequestService.listForUser(session.id);

  return (
    <div className="w-full text-ink select-none antialiased">
      <PageHeader
        breadcrumb={{ parent: "Arsip", current: "Surat Saya" }}
        title="Surat Saya"
        description="Riwayat seluruh pengajuan surat Anda."
        action={
          <Link href="/esurat/dashboard/ajukan" className="btn-primary">
            Ajukan Surat Baru
          </Link>
        }
        bordered
      />

      <div className="card-doc overflow-hidden rise-in mt-[20px]" style={{ animationDelay: "100ms" }}>
        {requests.length === 0 ? (
          <EmptyState
            title="Belum ada surat"
            description='Klik "Ajukan Surat Baru" untuk membuat pengajuan pertama Anda.'
          />
        ) : (
          <ul className="divide-y divide-line/70">
            {requests.map((r) => (
              <LetterRequestListItem
                key={r.id}
                href={`/esurat/dashboard/surat/${r.id}`}
                title={r.letterType.name}
                status={r.status}
                subtitle={
                  <p className="text-xs text-inkmut mt-1 truncate">
                    {r.letterNumber ? (
                      <span className="font-mono text-brass">
                        {r.letterNumber}
                        {" · "}
                      </span>
                    ) : null}
                    Diajukan {formatTanggal(r.createdAt)}
                  </p>
                }
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
