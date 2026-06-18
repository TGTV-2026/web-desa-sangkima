import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/utils/session";
import { letterTypeService } from "@/server/services/letterType.service";
import ToggleActiveButton from "./ToggleActiveButton";

export default async function JenisSuratPage() {
  const session = await getSessionUser();
  if (!session) redirect("/esurat");
  if (session.role !== "admin") redirect("/esurat/dashboard");

  const types = await letterTypeService.list(false);

  return (
    <div>
      <div className="rise-in">
        <p className="overline-doc">Pengaturan Layanan</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-1.5">
          Jenis Surat
        </h1>
        <p className="text-sm text-inkmut mt-2 mb-8 max-w-xl">
          Kelola jenis surat yang dapat diajukan warga. Jenis yang dinonaktifkan
          tidak muncul di formulir pengajuan, tetapi surat lama tetap sah.
        </p>
      </div>

      <div className="card-doc overflow-hidden rise-in" style={{ animationDelay: "100ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-inkmut border-b border-line">
                <th className="px-6 py-3.5 font-semibold">Kode</th>
                <th className="px-6 py-3.5 font-semibold">Nama</th>
                <th className="px-6 py-3.5 font-semibold">Field Tambahan</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-paper2/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-brass">
                    {t.code}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{t.name}</p>
                    {t.description && (
                      <p className="text-xs text-inkmut mt-0.5 max-w-xs leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-inkmut">
                    {t.requiredFields.length === 0
                      ? "—"
                      : t.requiredFields.map((f) => f.label).join(", ")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center border rounded-[3px] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] ${
                        t.active
                          ? "border-pine-600/50 text-pine-700 bg-pine-600/[0.06]"
                          : "border-line text-inkmut"
                      }`}
                    >
                      {t.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ToggleActiveButton id={t.id} active={t.active} name={t.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
