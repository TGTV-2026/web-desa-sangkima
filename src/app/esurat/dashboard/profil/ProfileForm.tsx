"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import FormField from "@/components/esurat/FormField";
import type { UserDTO } from "@/server/types/user";

// Re-declare agar tidak import langsung dari server types di client
type ProfileUser = Pick<
  UserDTO,
  | "id" | "name" | "nik" | "email" | "role"
  | "gender" | "placeOfBirth" | "birthday" | "religion"
  | "address" | "job" | "telp" | "citizenship" | "status" | "education"
  | "positionName" | "signatureUrl"
>;

const GENDER_OPTIONS = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

const RELIGION_OPTIONS = [
  { value: "islam", label: "Islam" },
  { value: "kristen", label: "Kristen" },
  { value: "katolik", label: "Katolik" },
  { value: "hindu", label: "Hindu" },
  { value: "buddha", label: "Buddha" },
  { value: "konghucu", label: "Konghucu" },
];

const CITIZENSHIP_OPTIONS = [
  { value: "wni", label: "Warga Negara Indonesia (WNI)" },
  { value: "wna", label: "Warga Negara Asing (WNA)" },
];

const MARITAL_OPTIONS = [
  { value: "Belum Menikah", label: "Belum Menikah" },
  { value: "Menikah", label: "Menikah" },
  { value: "Cerai Hidup", label: "Cerai Hidup" },
  { value: "Cerai Mati", label: "Cerai Mati" },
];

const EDUCATION_OPTIONS = [
  { value: "SD/Sederajat", label: "SD/Sederajat" },
  { value: "SMP/Sederajat", label: "SMP/Sederajat" },
  { value: "SMA/Sederajat", label: "SMA/Sederajat" },
  { value: "D1", label: "D1" },
  { value: "D2", label: "D2" },
  { value: "D3", label: "D3" },
  { value: "S1/Setara D4", label: "S1/Setara D4" },
  { value: "S2", label: "S2" },
  { value: "S3", label: "S3" },
];

/** Format Date/string ke YYYY-MM-DD untuk input date */
function toDateStr(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = typeof val === "string" ? val : val.toISOString().slice(0, 10);
  return d.slice(0, 10);
}

// ─── Aturan validasi (selaras dengan updateProfileSchema di server) ───────
function validateField(field: string, value: string): string {
  switch (field) {
    case "gender":
      return value ? "" : "Jenis kelamin wajib dipilih";
    case "placeOfBirth":
      return value.trim() ? "" : "Tempat lahir wajib diisi";
    case "birthday":
      return value ? "" : "Tanggal lahir wajib diisi";
    case "religion":
      return value ? "" : "Agama wajib dipilih";
    case "address":
      return value.trim() ? "" : "Alamat wajib diisi";
    case "job":
      return value.trim() ? "" : "Pekerjaan wajib diisi";
    case "telp":
      if (!value.trim()) return "No. HP wajib diisi";
      if (!/^(\+62|62|0)8[1-9]\d{6,10}$/.test(value))
        return "Format nomor HP tidak valid (contoh: 081234567890)";
      return "";
    case "citizenship":
      return value ? "" : "Kewarganegaraan wajib dipilih";
    case "status":
      return value ? "" : "Status perkawinan wajib dipilih";
    case "education":
      return value ? "" : "Pendidikan terakhir wajib dipilih";
    default:
      return "";
  }
}

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();

  const [gender, setGender] = useState(user.gender ?? "");
  const [placeOfBirth, setPlaceOfBirth] = useState(user.placeOfBirth ?? "");
  const [birthday, setBirthday] = useState(toDateStr(user.birthday));
  const [religion, setReligion] = useState(user.religion ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [job, setJob] = useState(user.job ?? "");
  const [telp, setTelp] = useState(user.telp ?? "");
  const [citizenship, setCitizenship] = useState(user.citizenship ?? "");
  const [status, setStatus] = useState(user.status ?? "");
  const [education, setEducation] = useState(user.education ?? "");
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [signatureCleared, setSignatureCleared] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper: set error untuk satu field
  const setError = (field: string, msg: string) =>
    setErrors((prev) => ({ ...prev, [field]: msg }));

  // Handler blur – validasi saat user meninggalkan field
  const handleBlur = (field: string, value: string) => {
    setError(field, validateField(field, value));
  };

  // Validasi semua field sekaligus (saat submit)
  const validateAll = (): boolean => {
    const values: Record<string, string> = {
      gender,
      placeOfBirth,
      birthday,
      religion,
      address,
      job,
      telp,
      citizenship,
      status,
      education,
    };
    const filtered: Record<string, string> = {};
    for (const [field, value] of Object.entries(values)) {
      const err = validateField(field, value);
      if (err) filtered[field] = err;
    }
    setErrors(filtered);
    return Object.keys(filtered).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateAll()) return;

    const fd = new FormData();
    fd.append("gender", gender);
    fd.append("placeOfBirth", placeOfBirth);
    fd.append("birthday", birthday);
    fd.append("religion", religion);
    fd.append("address", address);
    fd.append("job", job);
    fd.append("telp", telp);
    fd.append("citizenship", citizenship);
    fd.append("status", status);
    fd.append("education", education);

    if (signatureImage) {
      fd.append("signatureImage", signatureImage);
    } else if (signatureCleared) {
      fd.append("signatureUrl", "null");
    }

    await submit(
      () =>
        fetch("/esurat/api/users/profile", {
          method: "PUT",
          body: fd,
        }),
      {
        successMessage:
          "Data profil kependudukan Anda berhasil disimpan ke dalam sistem.",
        successTitle: "Profil Tersimpan",
        errorTitle: "Gagal Menyimpan",
        errorFallback: "Gagal memperbarui profil",
        extractErrorMessage: (json) => {
          // Tampilkan error per-field dari Zod di bawah masing-masing input
          if (json.errors) {
            const fieldErrors: Record<string, string> = {};
            for (const [key, msgs] of Object.entries(json.errors)) {
              if (Array.isArray(msgs) && msgs.length > 0) {
                fieldErrors[key] = msgs[0] as string;
              }
            }
            if (Object.keys(fieldErrors).length > 0) {
              setErrors(fieldErrors);
              return "Beberapa data masih belum valid. Periksa kembali formulir Anda.";
            }
          }
          return undefined;
        },
        onSuccess: () => {
          router.refresh();
        },
      },
    ).catch(() => {});
  };

  const labelCls = "text-xs font-bold tracking-wider text-pine-900";
  const inputCls = "mt-1.5 bg-paper3 text-ink placeholder:text-inkmut/50 transition-all duration-200 focus:bg-paper focus:text-pine-900 focus:border-pine-900 focus:ring-1 focus:ring-pine-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="card-doc p-5 sm:p-7 md:p-8 bg-paper border border-line/70 rounded-sm shadow-sm flex flex-col gap-6 text-ink"
    >
      {/* ─── SECTION 1: DATA IDENTITAS (READ-ONLY) ─── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-3 bg-pine-800 rounded-full shrink-0" />
          <h2 className="font-serif text-[18px] font-medium text-pine-900">
            Data Identitas
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`label-doc ${labelCls}`}>Nama Lengkap</label>
            <input
              type="text"
              value={user.name}
              readOnly
              className="input-doc mt-1.5 bg-paper2/50 text-inkmut cursor-not-allowed"
            />
          </div>
          <div>
            <label className={`label-doc ${labelCls}`}>NIK</label>
            <input
              type="text"
              value={user.nik}
              readOnly
              className="input-doc mt-1.5 bg-paper2/50 text-inkmut cursor-not-allowed"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={`label-doc ${labelCls}`}>Email</label>
            <input
              type="text"
              value={user.email}
              readOnly
              className="input-doc mt-1.5 bg-paper2/50 text-inkmut cursor-not-allowed"
            />
            <div className="flex flex-wrap gap-3 mt-3">
              <Link
                href="/esurat/dashboard/profil/ubah-email"
                className="btn-outline py-2 px-4 font-bold tracking-wide uppercase text-xs"
              >
                Ubah Email
              </Link>
              <Link
                href="/esurat/dashboard/profil/ubah-password"
                className="btn-outline py-2 px-4 font-bold tracking-wide uppercase text-xs"
              >
                Ubah Password
              </Link>
            </div>
          </div>
        </div>
        <p className="text-[14px] text-inkmut mt-2.5 leading-relaxed">
          Data identitas primer tidak dapat diubah lewat halaman ini. Hubungi
          petugas administrasi desa jika perlu koreksi.
        </p>
      </div>

      {/* ─── SECTION 2: DATA KEPENDUDUKAN ─── */}
      <div className="border-t border-line/50 pt-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-3 bg-brass rounded-full shrink-0" />
          <h2 className="font-serif text-[18px] font-medium text-pine-900">
            Data Kependudukan
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="profile-gender"
            label="Jenis Kelamin"
            type="select"
            value={gender}
            onChange={(val) => {
              setGender(val);
              if (errors.gender) setError("gender", validateField("gender", val));
            }}
            onBlur={() => handleBlur("gender", gender)}
            required
            placeholder="— Pilih —"
            options={GENDER_OPTIONS}
            error={errors.gender}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
          <FormField
            id="profile-religion"
            label="Agama"
            type="select"
            value={religion}
            onChange={(val) => {
              setReligion(val);
              if (errors.religion) setError("religion", validateField("religion", val));
            }}
            onBlur={() => handleBlur("religion", religion)}
            required
            placeholder="— Pilih —"
            options={RELIGION_OPTIONS}
            error={errors.religion}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
          <FormField
            id="profile-placeOfBirth"
            label="Tempat Lahir"
            value={placeOfBirth}
            onChange={(val) => {
              setPlaceOfBirth(val);
              if (errors.placeOfBirth) setError("placeOfBirth", validateField("placeOfBirth", val));
            }}
            onBlur={() => handleBlur("placeOfBirth", placeOfBirth)}
            required
            placeholder="Contoh: Sangkima"
            error={errors.placeOfBirth}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
          <FormField
            id="profile-birthday"
            label="Tanggal Lahir"
            type="date"
            value={birthday}
            onChange={(val) => {
              setBirthday(val);
              if (errors.birthday) setError("birthday", validateField("birthday", val));
            }}
            onBlur={() => handleBlur("birthday", birthday)}
            required
            error={errors.birthday}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
          <FormField
            id="profile-citizenship"
            label="Kewarganegaraan"
            type="select"
            value={citizenship}
            onChange={(val) => {
              setCitizenship(val);
              if (errors.citizenship) setError("citizenship", validateField("citizenship", val));
            }}
            onBlur={() => handleBlur("citizenship", citizenship)}
            required
            placeholder="— Pilih —"
            options={CITIZENSHIP_OPTIONS}
            error={errors.citizenship}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
          <FormField
            id="profile-status"
            label="Status Perkawinan"
            type="select"
            value={status}
            onChange={(val) => {
              setStatus(val);
              if (errors.status) setError("status", validateField("status", val));
            }}
            onBlur={() => handleBlur("status", status)}
            required
            placeholder="— Pilih —"
            options={MARITAL_OPTIONS}
            error={errors.status}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
          <FormField
            id="profile-education"
            label="Pendidikan Terakhir"
            type="select"
            value={education}
            onChange={(val) => {
              setEducation(val);
              if (errors.education) setError("education", validateField("education", val));
            }}
            onBlur={() => handleBlur("education", education)}
            required
            placeholder="— Pilih —"
            options={EDUCATION_OPTIONS}
            error={errors.education}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
        </div>
      </div>

      {/* ─── SECTION 3: KONTAK & PROFESI ─── */}
      <div className="border-t border-line/50 pt-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-3 bg-pine-600 rounded-full shrink-0" />
          <h2 className="font-serif text-[18px] font-medium text-pine-900">
            Kontak & Profesi
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="profile-telp"
            label="No. HP / Telepon"
            value={telp}
            onChange={(val) => {
              // Hanya terima angka, dengan opsional "+" di awal (kode negara)
              const stripped = val.replace(/[^\d+]/g, "");
              const filtered = stripped.startsWith("+")
                ? "+" + stripped.slice(1).replace(/\+/g, "")
                : stripped.replace(/\+/g, "");
              setTelp(filtered);
              if (errors.telp) setError("telp", validateField("telp", filtered));
            }}
            onBlur={() => handleBlur("telp", telp)}
            required
            maxLength={15}
            placeholder="Contoh: 081234567890"
            error={errors.telp}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
          <FormField
            id="profile-job"
            label="Pekerjaan"
            value={job}
            onChange={(val) => {
              setJob(val);
              if (errors.job) setError("job", validateField("job", val));
            }}
            onBlur={() => handleBlur("job", job)}
            required
            placeholder="Contoh: Petani, Wiraswasta, PNS"
            error={errors.job}
            labelClassName={labelCls}
            inputClassName={inputCls}
          />
          <div className="sm:col-span-2">
            <FormField
              id="profile-address"
              label="Alamat Lengkap"
              type="textarea"
              value={address}
              onChange={(val) => {
                setAddress(val);
                if (errors.address) setError("address", validateField("address", val));
              }}
              onBlur={() => handleBlur("address", address)}
              required
              placeholder="Tulis alamat lengkap termasuk RT/RW, kelurahan, kecamatan"
              rows={3}
              error={errors.address}
              labelClassName={labelCls}
              inputClassName={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION 4: SCAN TANDA TANGAN (Khusus Penandatangan) ─── */}
      {(user.positionName === "Kepala Desa" || user.positionName === "Sekretaris Desa") && (
        <div className="border-t border-line/50 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-3 bg-pine-600 rounded-full shrink-0" />
            <h2 className="font-serif text-[18px] font-medium text-pine-900 uppercase">
              Scan Tanda Tangan (Khusus Penandatangan Surat)
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            <span className="label-doc text-xs">Gambar tanda tangan (PNG transparan disarankan)</span>
            <div className="flex items-center gap-3">
              <div className="h-20 w-28 shrink-0 overflow-hidden border border-line bg-paper2/40">
                {signatureImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={URL.createObjectURL(signatureImage)}
                    alt="Pratinjau"
                    className="h-full w-full object-contain p-2"
                  />
                ) : user.signatureUrl && !signatureCleared ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.signatureUrl}
                    alt="Pratinjau"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-inkmut/50">
                    Tanpa gambar
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <input
                  id="signatureUpload"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSignatureImage(file);
                      setSignatureCleared(false);
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById("signatureUpload")?.click()}
                    className="btn-outline text-xs"
                  >
                    {(signatureImage || (user.signatureUrl && !signatureCleared)) ? "Ganti gambar" : "Unggah gambar"}
                  </button>
                  {(signatureImage || (user.signatureUrl && !signatureCleared)) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSignatureImage(null);
                        setSignatureCleared(true);
                      }}
                      className="btn-outline text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                {(signatureImage || (user.signatureUrl && !signatureCleared)) && (
                  <span className="max-w-[200px] truncate font-mono text-[10px] text-inkmut mt-1">
                    {signatureImage ? signatureImage.name : user.signatureUrl?.split("/").pop()}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-inkmut mt-1">
              Format: PNG/JPG (disarankan background transparan). Tanda tangan ini akan dicetak pada PDF surat yang disetujui.
            </p>
          </div>
        </div>
      )}

      {/* ─── SUBMIT ─── */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full shadow-sm py-3 px-4 font-bold tracking-wide uppercase text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Menyimpan Data..." : "Simpan Data Profil"}
        </button>
      </div>
    </form>
  );
}
