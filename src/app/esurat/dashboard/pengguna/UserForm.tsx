"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import FormField from "@/components/esurat/FormField";
import type { PositionDTO } from "@/server/types/position";
import type { UserDTO } from "@/server/types/user";

const RELIGIONS = ["islam", "kristen", "katolik", "hindu", "buddha", "konghucu"];
const MARITAL_STATUS = ["Belum Menikah", "Menikah", "Cerai Hidup", "Cerai Mati"];
const EDUCATIONS = [
  "SD/Sederajat", "SMP/Sederajat", "SMA/Sederajat",
  "D1", "D2", "D3", "S1/Setara D4", "S2", "S3",
];

// ponytail: validasi ringan selaras Zod server, server tetap sumber kebenaran
function validateField(field: string, value: string, password?: string): string {
  switch (field) {
    case "name":
      if (value.trim().length < 3) return "Nama minimal 3 karakter";
      return "";
    case "nik":
      if (!/^\d{16}$/.test(value)) return "NIK harus tepat 16 digit angka";
      return "";
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email tidak valid";
      return "";
    case "password":
      if (value && value.length < 8) return "Password minimal 8 karakter";
      return "";
    case "confirmPassword":
      if (password && value !== password) return "Konfirmasi password tidak cocok";
      return "";
    default:
      return "";
  }
}

type Props =
  | { mode: "create"; positions: PositionDTO[]; lockRoleToUser?: boolean }
  | {
      mode: "edit";
      positions: PositionDTO[];
      user: UserDTO;
      currentUserId: string;
      lockRoleToUser?: boolean;
    };

export default function UserForm(props: Props) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const initial = props.mode === "edit" ? props.user : undefined;
  const isSelf = props.mode === "edit" && props.currentUserId === props.user.id;
  const roleLocked = isSelf || !!props.lockRoleToUser;

  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [nik, setNik] = useState(initial?.nik ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(initial?.role ?? "user");
  const [nip, setNip] = useState(initial?.nip ?? "");
  const [positionId, setPositionId] = useState(initial?.positionId ?? "");
  const [religion, setReligion] = useState(initial?.religion ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [birthday, setBirthday] = useState(
    initial?.birthday ? new Date(initial.birthday).toISOString().slice(0, 10) : "",
  );
  const [placeOfBirth, setPlaceOfBirth] = useState(initial?.placeOfBirth ?? "");
  const [job, setJob] = useState(initial?.job ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "");
  const [telp, setTelp] = useState(initial?.telp ?? "");
  const [citizenship, setCitizenship] = useState(initial?.citizenship ?? "");
  const [status, setStatus] = useState(initial?.status ?? "");
  const [education, setEducation] = useState(initial?.education ?? "");
  const [signatureImage, setSignatureImage] = useState<File | null>(null);
  const [clearSignature, setClearSignature] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isWarga = role === "user";
  const isStaff = role === "staff";

  const handleRoleChange = (v: string) => {
    setRole(v as typeof role);
    if (v === "user") setPositionId(""); // warga tidak boleh punya jabatan
  };

  const handleBlur = (field: string, value: string) =>
    setErrors((e) => ({ ...e, [field]: validateField(field, value, password) }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fieldErrors = {
      name: validateField("name", name),
      nik: validateField("nik", nik),
      email: validateField("email", email),
      password: validateField("password", password),
      confirmPassword:
        props.mode === "create" && !confirmPassword
          ? "Konfirmasi password wajib diisi"
          : validateField("confirmPassword", confirmPassword, password),
      positionId: isStaff && !positionId ? "Jabatan wajib diisi untuk role staff" : "",
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    const fd = new FormData();
    if (name) fd.append("name", name);
    if (email) fd.append("email", email);
    if (nik) fd.append("nik", nik);
    if (role) fd.append("role", role);
    if (!isWarga && positionId) fd.append("positionId", positionId);
    else fd.append("positionId", "null");
    if (isStaff && nip) fd.append("nip", nip);
    else fd.append("nip", "null");
    
    if (religion) fd.append("religion", religion); else fd.append("religion", "null");
    if (address) fd.append("address", address); else fd.append("address", "null");
    if (birthday) fd.append("birthday", birthday); else fd.append("birthday", "null");
    if (placeOfBirth) fd.append("placeOfBirth", placeOfBirth); else fd.append("placeOfBirth", "null");
    if (job) fd.append("job", job); else fd.append("job", "null");
    if (gender) fd.append("gender", gender); else fd.append("gender", "null");
    if (telp) fd.append("telp", telp); else fd.append("telp", "null");
    if (citizenship) fd.append("citizenship", citizenship); else fd.append("citizenship", "null");
    if (status) fd.append("status", status); else fd.append("status", "null");
    if (education) fd.append("education", education); else fd.append("education", "null");
    if (password) fd.append("password", password);

    if (signatureImage) {
      fd.append("signatureImage", signatureImage);
    } else if (clearSignature) {
      fd.append("signatureUrl", "null");
    }

    const isEdit = props.mode === "edit";
    await submit(
      () =>
        fetch(isEdit ? `/esurat/api/users/${props.user.id}` : "/esurat/api/users", {
          method: isEdit ? "PUT" : "POST",
          body: fd,
        }),
      {
        successMessage: isEdit ? "Pengguna berhasil diperbarui." : "Pengguna baru berhasil dibuat.",
        successTitle: "Tersimpan",
        errorFallback: isEdit ? "Gagal memperbarui pengguna" : "Gagal membuat pengguna",
        extractErrorMessage: (json) =>
          json.errors && (Object.values(json.errors).flat()[0] as string | undefined),
        onSuccess: () => {
          if (isEdit) {
            router.refresh();
          } else {
            router.push("/esurat/dashboard/pengguna");
            router.refresh();
          }
        },
      },
    ).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Email")) setErrors((er) => ({ ...er, email: message }));
      if (message.includes("NIK")) setErrors((er) => ({ ...er, nik: message }));
      if (message.includes("Jabatan")) setErrors((er) => ({ ...er, positionId: message }));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-5 flex flex-col gap-4 md:gap-5 w-full">
      <div className="grid sm:grid-cols-2 gap-5">
        <FormField
          id="name" label="Nama Lengkap" value={name}
          onChange={setName} onBlur={() => handleBlur("name", name)}
          error={errors.name} required
        />
        <FormField
          id="nik" label="NIK" value={nik}
          onChange={(v) => setNik(v.replace(/\D/g, ""))} onBlur={() => handleBlur("nik", nik)}
          error={errors.nik} required maxLength={16}
        />
        <FormField
          id="email" label="Email" type="email" value={email}
          onChange={setEmail} onBlur={() => handleBlur("email", email)}
          error={errors.email} required
        />
        <FormField
          id="password" label={props.mode === "edit" ? "Password Baru" : "Password"}
          type="password" value={password}
          onChange={(v) => {
            setPassword(v);
            setErrors((er) => ({ ...er, confirmPassword: validateField("confirmPassword", confirmPassword, v) }));
          }}
          onBlur={() => handleBlur("password", password)}
          error={errors.password} required={props.mode === "create"}
          optionalHint={props.mode === "edit"}
          placeholder={props.mode === "edit" ? "Kosongkan jika tidak diubah" : undefined}
        />
        <FormField
          id="confirmPassword" label="Konfirmasi Password"
          type="password" value={confirmPassword}
          onChange={setConfirmPassword}
          onBlur={() => setErrors((er) => ({ ...er, confirmPassword: validateField("confirmPassword", confirmPassword, password) }))}
          error={errors.confirmPassword} required={props.mode === "create" || !!password}
          optionalHint={props.mode === "edit" && !password}
          placeholder={props.mode === "edit" ? "Kosongkan jika tidak diubah" : undefined}
        />
        <FormField
          id="role" label="Role" type="select" value={role}
          onChange={handleRoleChange} required
          disabled={roleLocked}
          labelAction={
            roleLocked && (
              <span className="text-[10px] font-normal normal-case tracking-normal text-inkmut/60 italic">
                {isSelf ? "Tidak bisa ubah role sendiri" : "Staff hanya bisa kelola akun warga"}
              </span>
            )
          }
          options={[
            { value: "user", label: "Warga" },
            { value: "staff", label: "Staff" },
            { value: "admin", label: "Admin" },
          ]}
        />
        <FormField
          id="positionId" label="Jabatan" type="select" value={isWarga ? "" : positionId}
          onChange={setPositionId}
          optionalHint={!isStaff}
          required={isStaff}
          disabled={isWarga}
          error={errors.positionId}
          onBlur={() =>
            setErrors((er) => ({
              ...er,
              positionId: isStaff && !positionId ? "Jabatan wajib diisi untuk role staff" : "",
            }))
          }
          placeholder={isWarga ? "— Warga tidak punya jabatan —" : "— Tanpa jabatan —"}
          options={props.positions.map((p) => ({ value: p.id, label: p.name }))}
        />
        {isStaff && (
          <FormField
            id="nip" label="NIP (Nomor Induk Pegawai)" value={nip}
            onChange={setNip} optionalHint
          />
        )}
        <FormField
          id="gender" label="Jenis Kelamin" type="select" value={gender}
          onChange={setGender} optionalHint placeholder="— Pilih —"
          options={[{ value: "L", label: "Laki-laki" }, { value: "P", label: "Perempuan" }]}
        />
        <FormField
          id="birthday" label="Tanggal Lahir" type="date" value={birthday}
          onChange={setBirthday} optionalHint
        />
        <FormField
          id="placeOfBirth" label="Tempat Lahir" value={placeOfBirth}
          onChange={setPlaceOfBirth} optionalHint
        />
        <FormField
          id="telp" label="No. HP" value={telp}
          onChange={setTelp} optionalHint
        />
        <FormField
          id="religion" label="Agama" type="select" value={religion}
          onChange={setReligion} optionalHint placeholder="— Pilih —"
          options={RELIGIONS.map((r) => ({ value: r, label: r[0].toUpperCase() + r.slice(1) }))}
        />
        <FormField
          id="status" label="Status Perkawinan" type="select" value={status}
          onChange={setStatus} optionalHint placeholder="— Pilih —"
          options={MARITAL_STATUS.map((s) => ({ value: s, label: s }))}
        />
        <FormField
          id="education" label="Pendidikan Terakhir" type="select" value={education}
          onChange={setEducation} optionalHint placeholder="— Pilih —"
          options={EDUCATIONS.map((e) => ({ value: e, label: e }))}
        />
        <FormField
          id="citizenship" label="Kewarganegaraan" type="select" value={citizenship}
          onChange={setCitizenship} optionalHint placeholder="— Pilih —"
          options={[{ value: "wni", label: "WNI" }, { value: "wna", label: "WNA" }]}
        />
        <FormField
          id="job" label="Pekerjaan" value={job}
          onChange={setJob} optionalHint
        />
      </div>

      <FormField
        id="address" label="Alamat" type="textarea" value={address}
        onChange={setAddress} optionalHint
      />

      {(() => {
        const selectedPosition = props.positions.find((p) => p.id === positionId);
        const isSignatory = selectedPosition?.category === "Kepala Desa" || selectedPosition?.category === "Sekretaris Desa";
        if (!isSignatory) return null;

        const currentSignatureUrl = props.mode === "edit" ? props.user.signatureUrl : null;
        const displayUrl = signatureImage ? URL.createObjectURL(signatureImage) : (!clearSignature ? currentSignatureUrl : null);

        return (
          <div className="flex flex-col gap-2 mt-2">
            <label className="label-doc">Scan Tanda Tangan (Khusus Penandatangan Surat)</label>
            <div className="flex items-start gap-4 flex-wrap">
              {displayUrl && (
                <div className="border border-line/50 p-2 rounded-sm bg-white shrink-0">
                  <img src={displayUrl} alt="Tanda Tangan" className="h-16 object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setSignatureImage(null);
                      setClearSignature(true);
                    }}
                    className="text-xs text-danger font-semibold mt-2 block w-full text-center hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              )}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="input-doc w-full text-sm py-2 px-3"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSignatureImage(file);
                      setClearSignature(false);
                    }
                  }}
                />
                <p className="text-[11px] text-inkmut mt-1">
                  Format: PNG/JPG (disarankan background transparan). Tanda tangan ini akan dicetak pada PDF surat yang disetujui.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="">
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? "Menyimpan..." : props.mode === "edit" ? "Simpan Perubahan" : "Buat Pengguna"}
        </button>
      </div>
    </form>
  );
}
