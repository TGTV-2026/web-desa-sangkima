import Link from "next/link";
import { requireCmsUser } from "@/server/utils/cmsSession";
import { navUntukRole, type AdminNavItem } from "./nav";
import TourLink from "./TourLink";

export const dynamic = "force-dynamic";

function SectionCard({ item }: { item: AdminNavItem }) {
  if (!item.ready) {
    return (
      <div className="card-doc flex items-start gap-3 p-4 opacity-60">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-paper2 font-serif text-lg text-inkmut">
          {item.label[0]}
        </span>
        <div>
          <span className="flex items-center gap-2 font-semibold text-pine-900">
            {item.label}
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-inkmut/50">
              Segera
            </span>
          </span>
          <p className="mt-0.5 text-[13px] leading-5 text-inkmut">{item.desc}</p>
        </div>
      </div>
    );
  }
  return (
    <Link
      href={item.href}
      className="card-doc group flex items-start gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-pine-700/40 hover:shadow-md"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-pine-900/[0.06] font-serif text-lg text-pine-800 transition-colors group-hover:bg-pine-900 group-hover:text-paper">
        {item.label[0]}
      </span>
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-pine-900 group-hover:text-brass">
          {item.label}
        </span>
        <p className="mt-0.5 text-[13px] leading-5 text-inkmut">{item.desc}</p>
      </div>
      <span className="mt-0.5 shrink-0 text-inkmut transition-transform group-hover:translate-x-0.5 group-hover:text-brass">
        →
      </span>
    </Link>
  );
}

const STEPS = [
  { n: "1", t: "Pilih bagian", d: "Klik salah satu kartu di bawah." },
  { n: "2", t: "Ubah isinya", d: "Ganti teks atau unggah foto lewat form." },
  { n: "3", t: "Klik Simpan", d: "Perubahan langsung tampil di website." },
];

export default async function AdminDashboardPage() {
  const user = await requireCmsUser();
  const items = navUntukRole(user.role);
  const konten = items.filter((i) => i.group === "konten");
  const pengaturan = items.filter((i) => i.group === "pengaturan");
  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-8">
      {/* Sambutan + cara pakai singkat */}
      <div className="card-doc overflow-hidden">
        <div className="bg-gradient-to-br from-pine-900 to-pine-800 px-6 py-6 text-paper">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brass">
            Halo, {firstName}
          </span>
          <h1 className="mt-1 font-serif text-[26px] font-medium text-paper">
            Kelola Isi Website Desa
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-paper/75">
            Pilih bagian di bawah, ubah isinya, lalu klik Simpan. Perubahan
            langsung tampil di website, tanpa perlu tahu kode sama sekali.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 p-5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex items-start gap-3 rounded-md border border-line bg-paper/60 p-3"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-pine-900 font-mono text-xs font-bold text-paper">
                {s.n}
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink">{s.t}</div>
                <div className="text-[12px] leading-5 text-inkmut">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-line bg-paper2/40 px-5 py-3">
          <span className="text-[13px] text-inkmut">
            Baru pertama kali? Ikuti panduan singkatnya.
          </span>
          <TourLink className="btn-primary ml-auto px-4 py-2 text-xs">
            ▶ Putar Tutorial
          </TourLink>
        </div>
      </div>

      {/* Isi website */}
      <section data-tour="cards">
        <div className="mb-3 flex items-baseline gap-3">
          <h2 className="font-serif text-xl text-pine-900">Isi Halaman Website</h2>
          <span className="text-[12px] text-inkmut">
            yang tampil untuk warga
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {konten.map((item) => (
            <SectionCard key={item.key} item={item} />
          ))}
        </div>
      </section>

      {/* Pengaturan & akun (super admin) */}
      {pengaturan.length > 0 && (
        <section>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="font-serif text-xl text-pine-900">
              Pengaturan &amp; Akun
            </h2>
            <span className="text-[12px] text-inkmut">khusus Super Admin</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pengaturan.map((item) => (
              <SectionCard key={item.key} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
