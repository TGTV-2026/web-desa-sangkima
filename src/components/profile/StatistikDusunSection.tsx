import Reveal from "./Reveal";
import StatistikDusunChart from "./StatistikDusunChart";
import { Home, Users } from "./icons";
import type { StatistikDusunContent } from "@/server/types/content";

export default function StatistikDusunSection({
  content,
}: {
  content: StatistikDusunContent;
}) {
  const dusun = content.dusun.map((d) => ({
    ...d,
    total: d.lakiLaki + d.perempuan,
  }));
  const totalPenduduk = dusun.reduce((s, d) => s + d.total, 0);
  const totalKK = dusun.reduce((s, d) => s + d.kk, 0);
  const chartData = [...dusun]
    .sort((a, b) => b.total - a.total)
    .map((d) => ({ nama: d.nama, total: d.total }));

  return (
    <section className="flex flex-col gap-10">
      <Reveal className="flex flex-col gap-2">
        <h2 className="font-serif text-[32px] font-medium leading-[40px] text-pine-900">
          Statistik Dusun
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-inkmut">
          Sebaran jumlah penduduk dan Kepala Keluarga (KK) di {dusun.length}{" "}
          dusun wilayah Desa Sangkima.
          {content.keterangan ? ` ${content.keterangan}.` : ""}
        </p>
      </Reveal>

      {/* Ringkasan total */}
      <Reveal className="grid grid-cols-3 gap-4">
        <div className="border border-line bg-card p-5 text-center sm:p-6">
          <span className="font-serif text-[28px] leading-none text-pine-900 sm:text-[36px]">
            {dusun.length}
          </span>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-inkmut">
            Dusun
          </p>
        </div>
        <div className="border border-line bg-card p-5 text-center sm:p-6">
          <span className="font-serif text-[28px] leading-none text-pine-900 sm:text-[36px]">
            {totalPenduduk.toLocaleString("id-ID")}
          </span>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-inkmut">
            Total Penduduk
          </p>
        </div>
        <div className="border border-line bg-card p-5 text-center sm:p-6">
          <span className="font-serif text-[28px] leading-none text-pine-900 sm:text-[36px]">
            {totalKK.toLocaleString("id-ID")}
          </span>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-inkmut">
            Kepala Keluarga
          </p>
        </div>
      </Reveal>

      {/* Kartu per dusun */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dusun.map((d, i) => (
          <Reveal key={d.nama} delay={i * 70}>
            <div className="flex h-full flex-col gap-4 border border-line bg-card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-lg leading-snug text-pine-900">
                  {d.nama}
                </h3>
                <Users className="h-5 w-5 shrink-0 text-brass" />
              </div>

              <div>
                <span className="font-serif text-[32px] leading-none text-pine-900">
                  {d.total.toLocaleString("id-ID")}
                </span>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-inkmut">
                  Jiwa
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-inkmut">
                <span>
                  L <b className="text-ink">{d.lakiLaki.toLocaleString("id-ID")}</b>
                  {" · "}
                  P <b className="text-ink">{d.perempuan.toLocaleString("id-ID")}</b>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper2/50 px-2.5 py-1">
                  <Home className="h-3.5 w-3.5 text-pine-700" />
                  {d.kk.toLocaleString("id-ID")} KK
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Grafik perbandingan */}
      <Reveal className="border border-line bg-card p-6 sm:p-8">
        <h3 className="mb-6 font-serif text-xl text-pine-900">
          Perbandingan Jumlah Penduduk Antar Dusun
        </h3>
        <StatistikDusunChart data={chartData} />
      </Reveal>
    </section>
  );
}
