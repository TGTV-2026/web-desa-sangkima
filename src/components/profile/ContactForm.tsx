"use client";

// Form "Kirim Pesan Resmi" pada seksi #kontak.
// Belum ada endpoint backend kontak — sebagai MVP, submit menyusun email lewat
// mailto: ke surel resmi desa. Bila kelak dibuat endpoint (mis. /esurat/api/kontak),
// ganti blok mailto dengan fetch + useSubmitAction.
import { useState, type FormEvent } from "react";
import FormField from "@/components/esurat/FormField";
import { useToast } from "@/hooks/useToast";
import { Send } from "./icons";

const EMAIL_TUJUAN = "pemdes@sangkima.desa.id";

const KATEGORI = [
  { value: "Layanan Administrasi", label: "Layanan Administrasi" },
  { value: "Pelaporan Infrastruktur", label: "Pelaporan Infrastruktur" },
  { value: "Informasi Desa", label: "Informasi Desa" },
  { value: "Lainnya", label: "Lainnya" },
];

export default function ContactForm() {
  const { toast } = useToast();
  const [nama, setNama] = useState("");
  const [nik, setNik] = useState("");
  const [kategori, setKategori] = useState(KATEGORI[0].value);
  const [pesan, setPesan] = useState("");
  const [errors, setErrors] = useState<{
    nama?: string;
    nik?: string;
    pesan?: string;
  }>({});

  function validate() {
    const next: typeof errors = {};
    if (!nama.trim()) next.nama = "Nama lengkap wajib diisi.";
    // NIK opsional, tapi jika diisi harus 16 digit (selaras aturan E-Surat).
    if (nik.trim() && !/^\d{16}$/.test(nik.trim()))
      next.nik = "NIK harus 16 digit angka.";
    if (!pesan.trim()) next.pesan = "Detail pesan wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const subjek = `[${kategori}] Pesan dari ${nama}`;
    const isi = [
      `Nama Lengkap: ${nama}`,
      nik.trim() ? `NIK: ${nik}` : null,
      `Kategori: ${kategori}`,
      "",
      pesan,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${EMAIL_TUJUAN}?subject=${encodeURIComponent(
      subjek,
    )}&body=${encodeURIComponent(isi)}`;
    toast(
      "Aplikasi email Anda akan terbuka dengan pesan yang sudah terisi.",
      "Menyiapkan pesan",
      "success",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          id="kontak-nama"
          label="Nama Lengkap"
          value={nama}
          onChange={setNama}
          placeholder="Nama sesuai KTP"
          required
          error={errors.nama}
        />
        <FormField
          id="kontak-nik"
          label="NIK"
          optionalHint
          value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))}
          placeholder="16 digit NIK"
          maxLength={16}
          error={errors.nik}
          inputClassName="font-mono"
        />
      </div>

      <FormField
        id="kontak-kategori"
        label="Kategori Pesan"
        type="select"
        value={kategori}
        onChange={setKategori}
        options={KATEGORI}
      />

      <FormField
        id="kontak-pesan"
        label="Detail Pesan"
        type="textarea"
        rows={5}
        value={pesan}
        onChange={setPesan}
        placeholder="Tuliskan pesan Anda secara jelas dan ringkas..."
        required
        error={errors.pesan}
      />

      <div className="flex justify-end border-t border-line pt-4">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-sm bg-pine-900 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-paper transition-colors hover:bg-pine-800"
        >
          Kirim Pesan
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
