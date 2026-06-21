// Ikon inline (Lucide-style) untuk situs web profile desa.
// Konsisten dengan gaya ikon E-Surat: stroke 1.7, linecap/linejoin round.
import type { SVGProps } from "react";

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </Svg>
  );
}

export function ArrowUp(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </Svg>
  );
}

export function Menu(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

export function Close(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

// Administrasi digital — dokumen/surat
export function FileText(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </Svg>
  );
}

// Ekowisata — pohon pinus/hutan
export function Trees(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M12 3 17 11h-3l4 6H6l4-6H7Z" />
      <path d="M12 17v4" />
    </Svg>
  );
}

// Potensi lokal / UMKM — toko
export function Store(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M3 9 4.5 4.5A1 1 0 0 1 5.4 4h13.2a1 1 0 0 1 .9.5L21 9" />
      <path d="M4 9v10h16V9M3 9h18" />
      <path d="M10 19v-5h4v5" />
    </Svg>
  );
}

export function MapPin(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

export function Mail(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  );
}

export function Share(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
    </Svg>
  );
}

// Kirim pesan — pesawat kertas
export function Send(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </Svg>
  );
}

// Buka peta / arah — penunjuk navigasi
export function Navigation(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M3 11 22 2l-9 19-2-8-8-2Z" />
    </Svg>
  );
}

// Petunjuk geser peta
export function Move(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M12 2v20M2 12h20M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3" />
    </Svg>
  );
}
