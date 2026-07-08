import type { Metadata } from "next";

// Layout tipis untuk seluruh /admin. Guard + shell ada di (panel)/layout.tsx
// agar halaman /admin/login tidak ikut terkunci.
export const metadata: Metadata = {
  title: "CMS — Desa Sangkima",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
