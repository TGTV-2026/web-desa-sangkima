import { siteContentService } from "@/server/services/siteContent.service";
import StatistikDusunEditor from "./StatistikDusunEditor";

export const dynamic = "force-dynamic";

export default async function AdminStatistikPage() {
  const statistik = await siteContentService.get("statistikDusun");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Halaman Profil</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Statistik Dusun
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Jumlah penduduk (laki-laki/perempuan) dan Kepala Keluarga (KK) tiap
          dusun. Tampil di halaman{" "}
          <span className="font-mono text-xs">/profil</span> sebagai kartu dan
          grafik perbandingan.
        </p>
      </div>
      <StatistikDusunEditor initial={statistik} />
    </div>
  );
}
