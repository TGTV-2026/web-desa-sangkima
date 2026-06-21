import type { Metadata } from "next";
import SiteNav from "@/components/profile/SiteNav";
import SiteFooter from "@/components/profile/SiteFooter";
import ScrollToTop from "@/components/profile/ScrollToTop";

export const metadata: Metadata = {
  title: "Desa Sangkima — Pemerintah Desa Sangkima",
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
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
      <ScrollToTop />
    </>
  );
}
