import Link from "next/link";
import { redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import {
  LETTER_STATUSES,
  LETTER_STATUS_META,
  type LetterStatus,
} from "@/server/types/letter";
import { formatTanggal } from "@/lib/format";

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function PermohonanPage({ searchParams }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role === "user") redirect("/esurat/dashboard");

  const { status: statusParam } = await searchParams;
  const status = LETTER_STATUSES.includes(statusParam as LetterStatus)
    ? (statusParam as LetterStatus)
    : undefined;

  const requests = await letterRequestService.listAll(status);

  const filters: { label: string; href: string; active: boolean }[] = [
    { label: "Semua", href: "/esurat/dashboard/permohonan", active: !status },
    ...LETTER_STATUSES.map((s) => ({
      label: LETTER_STATUS_META[s].label,
      href: `/esurat/dashboard/permohonan?status=${s}`,
      active: status === s,
    })),
  ];

  return (
    <div>
      <div className="rise-in">
        <p className="overline-doc">Buku Agenda</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-1.5">
          Permohonan Surat
        </h1>
        <p className="text-sm text-inkmut mt-2 mb-6">
          Kelola pengajuan surat dari warga.
        </p>
      </div>

      {/* Filter status */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 rise-in" style={{ animationDelay: "60ms" }}>
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`whitespace-nowrap rounded-[4px] border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              f.active
                ? "bg-pine-900 border-pine-900 text-paper"
                : "bg-card border-line text-inkmut hover:text-ink hover:bg-paper2/50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="card-doc overflow-hidden rise-in" style={{ animationDelay: "120ms" }}>
        {requests.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-lg">Tidak ada permohonan</p>
            <p className="text-sm text-inkmut mt-1">
              {status
                ? `Belum ada surat berstatus ${LETTER_STATUS_META[status].label}.`
                : "Permohonan dari warga akan tampil di sini."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-inkmut border-b border-line">
                  <th className="px-6 py-3.5 font-semibold">Pemohon</th>
                  <th className="px-6 py-3.5 font-semibold">Jenis Surat</th>
                  <th className="px-6 py-3.5 font-semibold">Tanggal</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-paper2/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{r.requester.name}</p>
                      <p className="font-mono text-xs text-inkmut mt-0.5">
                        {r.requester.nik}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {r.letterType.name}
                    </td>
                    <td className="px-6 py-4 text-inkmut">
                      {formatTanggal(r.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/esurat/dashboard/permohonan/${r.id}`}
                        className="text-xs font-semibold text-brass hover:underline underline-offset-2 whitespace-nowrap"
                      >
                        Periksa →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
