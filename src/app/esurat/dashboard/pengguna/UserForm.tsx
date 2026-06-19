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
  | { mode: "create"; positions: PositionDTO[] }
  | { mode: "edit"; positions: PositionDTO[]; user: UserDTO; currentUserId: string };

export default function UserForm(props: Props) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const initial = props.mode === "edit" ? props.user : undefined;
  const isSelf = props.mode === "edit" && props.currentUserId === props.user.id;

  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [nik, setNik] = useState(initial?.nik ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(initial?.role ?? "user");
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

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    const payload: Record<string, string | null> = {
      name,
      email,
      nik,
      role,
      positionId: positionId || null,
      religion: religion || null,
      address: address || null,
      birthday: birthday || null,
      placeOfBirth: placeOfBirth || null,
      job: job || null,
      gender: gender || null,
      telp: telp || null,
      citizenship: citizenship || null,
      status: status || null,
      education: education || null,
    };
    if (password) payload.password = password;

    const isEdit = props.mode === "edit";
    await submit(
      () =>
        fetch(isEdit ? `/esurat/api/users/${props.user.id}` : "/esurat/api/users", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-7 flex flex-col gap-5">
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
          onChange={(v) => setRole(v as typeof role)} required
          disabled={isSelf}
          labelAction={
            isSelf && (
              <span className="text-[10px] font-normal normal-case tracking-normal text-inkmut/60 italic">
                Tidak bisa ubah role sendiri
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
          id="positionId" label="Jabatan" type="select" value={positionId}
          onChange={setPositionId} optionalHint placeholder="— Tanpa jabatan —"
          options={props.positions.map((p) => ({ value: p.id, label: p.name }))}
        />
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

      <div className="pt-2">
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? "Menyimpan..." : props.mode === "edit" ? "Simpan Perubahan" : "Buat Pengguna"}
        </button>
      </div>
    </form>
  );
}
