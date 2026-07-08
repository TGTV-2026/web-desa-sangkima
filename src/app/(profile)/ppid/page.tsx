import type { Metadata } from "next";
import Reveal from "@/components/profile/Reveal";
import PpidCategories from "@/components/profile/PpidCategories";
import { MapPin, Mail } from "@/components/profile/icons";
import { siteContentService } from "@/server/services/siteContent.service";
import { ppidService } from "@/server/services/ppid.service";

export const metadata: Metadata = {
  title: "PPID - Desa Sangkima",
  description:
    "Pejabat Pengelola Informasi dan Dokumentasi (PPID) Desa Sangkima. Layanan dan daftar informasi publik sesuai UU Keterbukaan Informasi Publik.",
};

export const dynamic = "force-dynamic";

export default async function PpidPage() {
  const [ppid, docs] = await Promise.all([
    siteContentService.get("ppid"),
    ppidService.listPublished(),
  ]);

  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-16 px-5 pb-24 pt-28 md:px-12 md:pt-32">
      {/* Header */}
      <Reveal className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
          Keterbukaan Informasi Publik
        </span>
        <h1 className="font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pine-900 md:text-[56px] md:leading-[60px]">
          PPID Desa Sangkima
        </h1>
        <p className="text-sm leading-6 text-inkmut">
          Pejabat Pengelola Informasi dan Dokumentasi
        </p>
      </Reveal>

      <Reveal className="mx-auto max-w-3xl text-center text-[15px] leading-7 text-ink">
        {ppid.ringkasan}
      </Reveal>

      <div className="h-px w-full bg-line" />

      {/* Daftar informasi publik */}
      <Reveal>
        <PpidCategories docs={docs} />
      </Reveal>

      <div className="h-px w-full bg-line" />

      {/* Tugas & prosedur */}
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <Reveal>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Tugas & Fungsi
          </span>
          <h2 className="mt-3 font-serif text-[26px] font-medium leading-tight text-pine-900">
            Tugas PPID Desa
          </h2>
          <ul className="mt-5 flex flex-col gap-3">
            {ppid.tugas.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm leading-6 text-ink">
                <span className="mt-0.5 font-mono text-xs text-brass">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={80}>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Alur Layanan
          </span>
          <h2 className="mt-3 font-serif text-[26px] font-medium leading-tight text-pine-900">
            Prosedur Permohonan Informasi
          </h2>
          <ol className="mt-5 flex flex-col gap-3">
            {ppid.prosedur.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm leading-6 text-ink">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pine-900 font-mono text-[11px] text-paper">
                  {i + 1}
                </span>
                <span className="pt-0.5">{p}</span>
              </li>
            ))}
          </ol>
          {ppid.waktuLayanan && (
            <p className="mt-5 rounded-sm border border-line bg-paper2/40 px-4 py-3 text-[13px] leading-6 text-inkmut">
              <span className="font-semibold text-ink">Jangka waktu: </span>
              {ppid.waktuLayanan}
            </p>
          )}
        </Reveal>
      </div>

      {/* Kontak PPID */}
      {(ppid.kontakNama ||
        ppid.kontakTelepon ||
        ppid.kontakEmail ||
        ppid.kontakAlamat) && (
        <Reveal className="rounded-sm border border-line bg-card p-6 md:p-8">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Hubungi PPID
          </span>
          <h2 className="mt-2 font-serif text-[24px] font-medium text-pine-900">
            {ppid.kontakNama || "Kontak PPID"}
          </h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-ink md:flex-row md:flex-wrap md:gap-8">
            {ppid.kontakAlamat && (
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-pine-800" />
                {ppid.kontakAlamat}
              </span>
            )}
            {ppid.kontakEmail && (
              <span className="flex items-center gap-2">
                <Mail className="h-[18px] w-[18px] shrink-0 text-pine-800" />
                {ppid.kontakEmail}
              </span>
            )}
            {ppid.kontakTelepon && (
              <span className="flex items-center gap-2">
                <span className="font-semibold text-pine-800">Telp.</span>
                {ppid.kontakTelepon}
              </span>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}
