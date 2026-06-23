import type { Metadata } from "next";
import Reveal from "@/components/profile/Reveal";
import Seal from "@/components/profile/Seal";
import { Eye, Person } from "@/components/profile/icons";
import MisiAssemble from "@/components/profile/MisiAssemble";

export const metadata: Metadata = {
  title: "Profil Desa Sangkima — Sejarah, Visi & Misi, Struktur",
  description:
    "Sejarah singkat, visi & misi, dan struktur organisasi Pemerintah Desa Sangkima, Kecamatan Sangatta Selatan, Kabupaten Kutai Timur.",
};

// Catatan: teks sejarah, nama aparatur, dan NIP di bawah masih CONTOH dari desain —
// ganti dengan data resmi desa.
const SEJARAH = [
  "Desa Sangkima lahir dari sebuah pemukiman perintis yang secara bertahap berkembang menjadi entitas administratif otonom. Pada awal pembentukannya, wilayah ini didominasi oleh rimbunan hutan sekunder dan aliran sungai yang menjadi urat nadi kehidupan para pemukim pertama.",
  "Melalui keputusan definitif pada tahun-tahun awal kemerdekaan, Sangkima resmi diakui sebagai desa, membawa serta tanggung jawab untuk menata administrasi kependudukan dan mengelola sumber daya alam secara mandiri. Perjalanan panjang ini terekam dalam berbagai arsip fisik yang kini tersimpan rapi, menjadi saksi transformasi struktural dari sebuah dusun kecil menjadi desa yang berdaya saing.",
  "Seiring berjalannya waktu, struktur organisasi desa terus disempurnakan. Sistem pencatatan yang dahulunya bergantung pada tradisi lisan dan manuskrip sederhana perlahan bertransformasi menjadi sistem tata usaha yang lebih presisi dan terintegrasi, mencerminkan komitmen terhadap pelayanan publik yang transparan dan akuntabel.",
];

const VISI =
  "Terciptanya Transparansi Tata Kelola Pemerintahan Untuk Desa Sangkima Yang Profesional, Mandiri, dan Aman";

const MISI = [
  "Memperkuat tata kelola pemerintahan desa yang efektif, demokratis, transparan, akuntabel, dan profesional melalui peningkatan kapasitas bagi aparatur desa, kepala desa, BPD, LPM, dan KPMD.",
  "Memperkuat kemandirian ekonomi masyarakat melalui kegiatan pertanian dan pemanfaatan potensi sumber daya alam yang tersedia.",
  "Percepatan pembangunan infrastruktur dan akses layanan dasar untuk meningkatkan derajat kehidupan masyarakat.",
  "Pelestarian lingkungan hidup dan potensi alam untuk mewujudkan desa wisata yang berwawasan lingkungan.",
  "Mengupayakan terwujudnya pemerataan kesempatan kerja bagi masyarakat khususnya usia produktif.",
  "Meningkatkan kesejahteraan masyarakat desa dengan mewujudkan Badan Usaha Milik Desa (BUMDes) dan program lainnya untuk membuka peluang lapangan kerja bagi masyarakat.",
  "Meningkatkan sarana dan prasarana desa dari aspek fisik, ekonomi, pendidikan, kesehatan, olahraga, serta sosial budaya.",
];

const APARATUR = [
  { jabatan: "Sekretaris Desa", nama: "Siti Aminah, S.A.P" },
  { jabatan: "Kaur Keuangan", nama: "Budi Santoso" },
  { jabatan: "Kasi Pemerintahan", nama: "M. Rahmat" },
  { jabatan: "Kasi Kesejahteraan", nama: "Nurhayati" },
];

export default function ProfilPage() {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-24 px-5 pb-24 pt-28 md:px-12 md:pt-32">
      {/* Hero judul */}
      <Reveal className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-6 text-center">
        <div className="inline-flex items-center border border-line bg-card px-3 py-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brass">
            Arsip Resmi
          </span>
        </div>
        <h1 className="font-serif text-[40px] font-medium leading-[44px] tracking-[-0.02em] text-pine-900 md:text-[60px] md:leading-[64px]">
          Profil Desa Sangkima
        </h1>
        <p className="text-sm leading-6 text-inkmut">
          Menyusuri jejak sejarah, memahami arah tujuan, dan mengenal struktur
          administratif yang menggerakkan tatanan masyarakat kami.
        </p>
      </Reveal>

      <div className="h-px w-full bg-line" />

      {/* Sejarah Singkat — editorial 2 kolom */}
      <section className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <Reveal className="flex flex-col gap-6 lg:col-span-5 lg:sticky lg:top-28">
          <h2 className="font-serif text-[32px] font-medium leading-[40px] text-pine-900">
            Sejarah Singkat
          </h2>
          <p className="text-sm leading-6 text-inkmut">
            Catatan pembentukan wilayah, perkembangan demografi, hingga
            tonggak-tonggak penting yang membentuk karakter dan tatanan sosial
            masyarakat Desa Sangkima dari masa ke masa.
          </p>
          <Seal className="mt-2 hidden bg-card md:block">
            <div className="overflow-hidden">
              <img
                src="/profile/galeri/hutan-lindung.jpg"
                alt="Lanskap Desa Sangkima dengan hutan dan perbukitan"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover opacity-80 grayscale sd-zoom"
              />
            </div>
          </Seal>
        </Reveal>

        <Reveal
          className="flex flex-col gap-6 border-line lg:col-span-7 lg:border-l lg:pl-10"
          delay={150}
        >
          {SEJARAH.map((p, i) => (
            <p key={i} className="text-[15px] leading-7 text-ink">
              {p}
            </p>
          ))}
        </Reveal>
      </section>

      <div className="h-px w-full bg-line" />

      {/* Visi & Misi */}
      <section className="flex flex-col">
        <Reveal className="mb-12 flex flex-col items-center gap-4 text-center">
          <Eye className="h-9 w-9 text-brass" />
          <h2 className="font-serif text-[36px] uppercase leading-tight tracking-[0.08em] text-pine-900">
            Visi &amp; Misi
          </h2>
          <div className="h-px w-24 bg-brass" />
        </Reveal>

        <MisiAssemble visi={VISI} misi={MISI} />
      </section>

      <div className="h-px w-full bg-line" />

      {/* Struktur Organisasi */}
      <section className="flex flex-col gap-10">
        <Reveal className="flex flex-col gap-2">
          <h2 className="font-serif text-[32px] font-medium leading-[40px] text-pine-900">
            Struktur Organisasi
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-inkmut">
            Jajaran aparatur yang bertugas menyelenggarakan roda pemerintahan dan
            memberikan pelayanan administratif kepada warga.
          </p>
        </Reveal>

        {/* Kepala Desa */}
        <Reveal className="w-full md:w-2/3 lg:w-1/2">
          <Seal className="bg-card">
            <div className="flex flex-col items-center gap-6 bg-paper2/30 p-6 sm:flex-row sm:items-start">
              <div className="flex h-40 w-32 shrink-0 items-center justify-center border border-line bg-card text-inkmut/40">
                <Person className="h-16 w-16" />
              </div>
              <div className="flex flex-col gap-4 pt-2 text-center sm:text-left">
                <div className="inline-flex self-center border border-pine-900/20 bg-pine-900/5 px-2 py-1 sm:self-start">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-pine-900">
                    Kepala Desa
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-[24px] leading-tight text-pine-900">
                    H. Ahmad Hidayat
                  </h3>
                  <p className="mt-1 font-mono text-xs text-inkmut">
                    NIP. 19700512 199803 1 004
                  </p>
                </div>
              </div>
            </div>
          </Seal>
        </Reveal>

        {/* Aparatur */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {APARATUR.map((a, i) => (
            <Reveal key={a.nama} delay={i * 90}>
              <div className="flex h-full flex-col items-center gap-4 border border-line bg-card p-4 transition-shadow hover:shadow-md">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-line bg-paper2/40 text-inkmut/40">
                  <Person className="h-10 w-10" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brass">
                    {a.jabatan}
                  </span>
                  <h4 className="font-bold text-ink">{a.nama}</h4>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
