import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { formatTanggal } from "@/lib/format";

export default async function SuratSayaPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");

  const requests = await letterRequestService.listForUser(session.id);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10 rise-in">
        <div>
          <p className="overline-doc">Arsip Pribadi</p>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-1.5">
            Surat Saya
          </h1>
          <p className="text-sm text-inkmut mt-2">
            Riwayat seluruh pengajuan surat Anda.
          </p>
        </div>
        <Link href="/esurat/dashboard/ajukan" className="btn-primary">
          Ajukan Surat Baru
        </Link>
      </div>

      <div className="card-doc overflow-hidden rise-in" style={{ animationDelay: "100ms" }}>
        {requests.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-lg">Belum ada surat</p>
            <p className="text-sm text-inkmut mt-1">
              Klik “Ajukan Surat Baru” untuk membuat pengajuan pertama Anda.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line/70">
            {requests.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/esurat/dashboard/surat/${r.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-paper2/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {r.letterType.name}
                    </p>
                    <p className="text-xs text-inkmut mt-1 truncate">
                      {r.letterNumber ? (
                        <span className="font-mono text-brass">
                          {r.letterNumber}
                          {" · "}
                        </span>
                      ) : null}
                      Diajukan {formatTanggal(r.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
