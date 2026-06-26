"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import FormField from "@/components/esurat/FormField";

type Errors = Partial<Record<"oldPassword" | "newPassword" | "confirmPassword", string>>;

// Meniru aturan changePasswordSchema di server untuk feedback cepat.
function validate(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string,
): Errors {
  const errors: Errors = {};
  if (!oldPassword) errors.oldPassword = "Password lama wajib diisi";
  if (newPassword.length < 8)
    errors.newPassword = "Password baru minimal 8 karakter";
  else if (newPassword === oldPassword)
    errors.newPassword = "Password baru harus berbeda dari password lama";
  if (!confirmPassword) errors.confirmPassword = "Konfirmasi password wajib diisi";
  else if (confirmPassword !== newPassword)
    errors.confirmPassword = "Password baru dan konfirmasi tidak cocok";
  return errors;
}

export default function ChangePasswordForm() {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: keyof Errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(oldPassword, newPassword, confirmPassword);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    await submit(
      () =>
        fetch("/esurat/api/auth/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
        }),
      {
        successMessage: "Kata sandi akun Anda berhasil diperbarui.",
        successTitle: "Password Diubah",
        errorTitle: "Gagal Mengubah Password",
        errorFallback: "Gagal mengubah password",
        extractErrorMessage: (json) => {
          // Tampilkan error per-field inline (mis. "Password lama salah"),
          // toast tetap memakai json.message sebagai ringkasan.
          const fe = json.errors;
          if (fe)
            setErrors((prev) => ({
              oldPassword: fe.oldPassword?.[0] ?? prev.oldPassword,
              newPassword: fe.newPassword?.[0] ?? prev.newPassword,
              confirmPassword: fe.confirmPassword?.[0] ?? prev.confirmPassword,
            }));
          return json.message as string | undefined;
        },
        onSuccess: () => {
          router.push("/esurat/dashboard/profil");
          router.refresh();
        },
      },
    ).catch(() => {});
  };

  const cardCls =
    "card-doc p-5 sm:p-7 md:p-8 bg-paper border border-line/70 rounded-sm shadow-sm flex flex-col gap-5 text-ink";

  return (
    <form onSubmit={handleSubmit} className={cardCls}>
      <FormField
        id="oldPassword"
        type="password"
        label="Password Lama"
        value={oldPassword}
        onChange={(val) => {
          setOldPassword(val);
          clearError("oldPassword");
        }}
        placeholder="Masukkan password Anda saat ini"
        autoComplete="current-password"
        required
        error={errors.oldPassword}
      />

      <FormField
        id="newPassword"
        type="password"
        label="Password Baru"
        value={newPassword}
        onChange={(val) => {
          setNewPassword(val);
          clearError("newPassword");
        }}
        placeholder="Minimal 8 karakter"
        autoComplete="new-password"
        required
        error={errors.newPassword}
      />

      <FormField
        id="confirmPassword"
        type="password"
        label="Konfirmasi Password Baru"
        value={confirmPassword}
        onChange={(val) => {
          setConfirmPassword(val);
          clearError("confirmPassword");
        }}
        placeholder="Ulangi password baru"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
        <Link
          href="/esurat/dashboard/profil"
          className="btn-outline w-full sm:w-auto text-center py-3 px-5 font-bold tracking-wide uppercase text-xs"
        >
          Batal
        </Link>
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full shadow-sm py-3 px-4 font-bold tracking-wide uppercase text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Menyimpan..." : "Simpan Password Baru"}
        </button>
      </div>
    </form>
  );
}
