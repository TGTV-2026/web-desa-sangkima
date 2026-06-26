import Link from "next/link";
import { ADMIN_NAV } from "./nav";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Ringkasan</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Kelola Konten Web Profil
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Pilih bagian yang ingin disunting. Perubahan langsung tampil di situs
          publik setelah disimpan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ADMIN_NAV.map((item) =>
          item.ready ? (
            <Link
              key={item.key}
              href={item.href}
              className="card-doc group flex flex-col gap-1 p-5 transition-shadow hover:shadow-md"
            >
              <span className="font-serif text-lg text-pine-900 group-hover:text-brass">
                {item.label}
              </span>
              <span className="text-sm text-inkmut">Sunting konten</span>
            </Link>
          ) : (
            <div
              key={item.key}
              className="card-doc flex flex-col gap-1 p-5 opacity-60"
            >
              <span className="flex items-center justify-between font-serif text-lg text-pine-900">
                {item.label}
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-inkmut/50">
                  Segera
                </span>
              </span>
              <span className="text-sm text-inkmut">Editor sedang disiapkan</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
