import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StatusBadge from "@/components/esurat/StatusBadge";
import LampiranList from "@/components/esurat/LampiranList";
import { getSessionUser } from "@/server/utils/session";
import { letterRequestService } from "@/server/services/letterRequest.service";
import { formatTanggalWaktu } from "@/lib/format";
import PermohonanActions from "./PermohonanActions";

type PageProps = { params: Promise<{ id: string }> };

export default async function DetailPermohonanPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role === "user") redirect("/esurat/dashboard");

  const { id } = await params;
  let surat;
  try {
    surat = await letterRequestService.getForActor(id, session);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/esurat/dashboard/permohonan"
        className="text-xs font-semibold text-brass hover:underline underline-offset-2 rise-in inline-block"
      >
        ← Kembali ke Permohonan
      </Link>

      <div className="card-doc p-6 md:p-8 mt-4 rise-in" style={{ animationDelay: "80ms" }}>
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-line">
          <div>
            <p className="overline-doc !text-inkmut">{surat.letterType.code}</p>
            <h1 className="font-serif text-3xl font-medium tracking-tight mt-1">
              {surat.letterType.name}
            </h1>
            {surat.letterNumber && (
              <p className="font-mono text-sm text-brass mt-2">
                {surat.letterNumber}
              </p>
            )}
          </div>
          <StatusBadge status={surat.status} />
        </div>

        {surat.status === "DITOLAK" && surat.rejectionReason && (
          <div className="bg-oxide/[0.05] border border-oxide/30 rounded-[4px] px-4 py-3 mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-oxide">
              Alasan Penolakan
            </p>
            <p className="text-sm text-ink mt-1.5">{surat.rejectionReason}</p>
          </div>
        )}

        <dl className="text-sm mt-6">
          <div className="flex justify-between gap-6 py-2.5 border-b border-dotted border-line">
            <dt className="text-inkmut">Pemohon</dt>
            <dd className="font-medium text-right">{surat.requester.name}</dd>
          </div>
          <div className="flex justify-between gap-6 py-2.5 border-b border-dotted border-line">
            <dt className="text-inkmut">NIK</dt>
            <dd className="font-mono text-[13px] text-right">
              {surat.requester.nik}
            </dd>
          </div>
          <div className="flex justify-between gap-6 py-2.5 border-b border-dotted border-line">
            <dt className="text-inkmut">Keperluan</dt>
            <dd className="font-medium text-right">{surat.purpose}</dd>
          </div>
          {surat.data &&
            Object.entries(surat.data).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between gap-6 py-2.5 border-b border-dotted border-line"
              >
                <dt className="text-inkmut capitalize">
                  {k.replace(/([A-Z])/g, " $1").toLowerCase()}
                </dt>
                <dd className="font-medium text-right">{String(v ?? "-")}</dd>
              </div>
            ))}
          <div className="flex justify-between gap-6 py-2.5 border-b border-dotted border-line">
            <dt className="text-inkmut">Diajukan</dt>
            <dd className="font-medium text-right">
              {formatTanggalWaktu(surat.createdAt)}
            </dd>
          </div>
          {surat.approvedAt && (
            <div className="flex justify-between gap-6 py-2.5 border-b border-dotted border-line">
              <dt className="text-inkmut">Disetujui</dt>
              <dd className="font-medium text-right">
                {formatTanggalWaktu(surat.approvedAt)}
              </dd>
            </div>
          )}
        </dl>

        <LampiranList requestId={surat.id} attachments={surat.attachments} />

        <PermohonanActions
          id={surat.id}
          status={surat.status}
          role={session.role}
        />
      </div>
    </div>
  );
}
