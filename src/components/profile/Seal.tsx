// Bingkai "stempel/sertifikat" — double border (garis luar + garis dalam inset),
// meniru sertifikat keaslian. Bagian dari bahasa desain "arsip resmi desa".
import type { ReactNode } from "react";

export default function Seal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative border border-inkmut/35 p-2 ${className}`}>
      <span className="pointer-events-none absolute inset-1.5 border border-line" />
      <div className="relative">{children}</div>
    </div>
  );
}
