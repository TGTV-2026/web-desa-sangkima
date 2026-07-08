import Link from "next/link";
import { MapPin, Mail, Share } from "./icons";
import { siteContentService } from "@/server/services/siteContent.service";

const NAVIGASI = [
  { label: "Beranda", href: "/#beranda" },
  { label: "Layanan Digital", href: "/#layanan" },
  { label: "Profil Desa", href: "/profil" },
  { label: "Berita & Pengumuman", href: "/berita" },
  { label: "Produk Koperasi", href: "/produk" },
  { label: "PPID / Informasi Publik", href: "/ppid" },
  { label: "Galeri & Potensi", href: "/#galeri" },
];

const LEGAL = [
  "Kebijakan Privasi",
  "Syarat & Ketentuan",
  "Peta Situs",
  "Aksesibilitas",
];

export default async function SiteFooter() {
  const footer = await siteContentService.get("footer");
  return (
    <footer className="w-full border-t border-pine-800/40 bg-pine-950 pb-8 pt-16 text-paper">
      <div className="mx-auto mb-12 grid max-w-[1280px] grid-cols-1 gap-8 px-5 md:grid-cols-4 md:px-12">
        {/* Brand */}
        <div>
          <h2 className="mb-4 font-serif text-[32px] leading-none text-paper">
            DESA SANGKIMA
          </h2>
          <p className="text-sm leading-6 text-paper/70">{footer.deskripsi}</p>
        </div>

        {/* Navigasi */}
        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-paper">
            Navigasi
          </h3>
          <ul className="space-y-3 text-sm text-paper/70">
            {NAVIGASI.map((n) => (
              <li key={n.label}>
                <a
                  href={n.href}
                  className="transition-colors duration-200 hover:text-brass"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-paper">
            Legal
          </h3>
          <ul className="space-y-3 text-sm text-paper/70">
            {LEGAL.map((l) => (
              <li key={l}>
                <a
                  href="#"
                  className="transition-colors duration-200 hover:text-brass"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-paper">
            Kontak Kami
          </h3>
          <ul className="space-y-3 text-sm text-paper/70">
            <li className="flex items-start gap-2 transition-transform duration-300 hover:translate-x-1">
              <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0" />
              <span>{footer.alamat}</span>
            </li>
            <li className="flex items-center gap-2 transition-transform duration-300 hover:translate-x-1">
              <Mail className="h-[18px] w-[18px] shrink-0" />
              <span>{footer.email}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between border-t border-pine-800/40 px-5 pt-8 md:flex-row md:px-12">
        <p className="mb-4 text-sm text-paper/70 md:mb-0">
          © {new Date().getFullYear()} Pemerintah Desa Sangkima. Hak Cipta
          Dilindungi Undang-Undang.
        </p>
        <div className="flex gap-4 text-paper/70">
          <Link
            href="#"
            aria-label="Bagikan"
            className="transition-transform duration-300 hover:scale-110 hover:text-brass"
          >
            <Share className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
