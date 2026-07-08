import Link from "next/link";
import { ppidService } from "@/server/services/ppid.service";
import PpidDocList from "./PpidDocList";

export const dynamic = "force-dynamic";

export default async function AdminPpidPage() {
  const items = await ppidService.listAll();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="overline-doc text-brass">Keterbukaan Informasi</span>
          <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
            PPID / Informasi Publik
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
            Kelola daftar dokumen informasi publik yang tampil di{" "}
            <span className="font-mono text-xs">/ppid</span>. Untuk mengubah teks
            halaman (ringkasan, tugas, prosedur, kontak), buka{" "}
            <Link
              href="/admin/ppid/pengaturan"
              className="font-semibold text-pine-800 underline"
            >
              Pengaturan Halaman
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link href="/admin/ppid/baru" className="btn-primary">
            + Tambah Dokumen
          </Link>
          <Link
            href="/admin/ppid/pengaturan"
            className="btn-outline text-xs"
          >
            Pengaturan Halaman
          </Link>
        </div>
      </div>

      <PpidDocList items={items} />
    </div>
  );
}
