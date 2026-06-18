import Link from "next/link";
import StatusBadge from "@/components/esurat/StatusBadge";
import { formatTanggal } from "@/lib/format";
import type { LetterRequestDTO } from "@/server/types/letter";

export interface PermohonanTableProps {
  requests: Pick<LetterRequestDTO, "id" | "requester" | "letterType" | "status" | "createdAt">[];
}

/** Tabel daftar permohonan surat untuk petugas/admin, tertaut ke halaman detail. */
export default function PermohonanTable({ requests }: PermohonanTableProps) {
  return (
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
              <td className="px-6 py-4 font-medium">{r.letterType.name}</td>
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
  );
}
