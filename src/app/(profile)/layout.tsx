import type { Metadata } from "next";
import SiteNav from "@/components/profile/SiteNav";
import SiteFooter from "@/components/profile/SiteFooter";
import ScrollToTop from "@/components/profile/ScrollToTop";
import ScrollSnap from "@/components/profile/ScrollSnap";

export const metadata: Metadata = {
  title: "Desa Sangkima",
  description:
    "Situs resmi Pemerintah Desa Sangkima, Kecamatan Sangatta Selatan, Kabupaten Kutai Timur. Pusat informasi, profil desa, potensi lokal, dan layanan administrasi digital.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Scroll-snap lembut khusus halaman profil */}
      <ScrollSnap />
      {/* Bilah progres scroll di paling atas (tumbuh mengikuti scroll) */}
      <div className="sd-progress fixed inset-x-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-pine-700 via-brass to-pine-700" />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      <ScrollToTop />
    </>
  );
}
