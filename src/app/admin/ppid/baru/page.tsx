import Link from "next/link";
import PpidDocForm from "../PpidDocForm";

export default function AdminPpidBaruPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/ppid"
          className="text-[11px] font-bold uppercase tracking-[0.18em] text-inkmut hover:text-pine-900"
        >
          ← Daftar Dokumen PPID
        </Link>
        <h1 className="mt-2 font-serif text-[28px] font-medium text-pine-900">
          Tambah Dokumen Informasi Publik
        </h1>
      </div>
      <PpidDocForm />
    </div>
  );
}
