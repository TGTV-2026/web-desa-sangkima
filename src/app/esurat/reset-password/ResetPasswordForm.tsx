"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import AuthSplitLayout from "@/components/esurat/auth/AuthSplitLayout";
import AuthFormHeader from "@/components/esurat/auth/AuthFormHeader";
import FormField from "@/components/esurat/FormField";

type Errors = Partial<Record<"newPassword" | "confirmPassword", string>>;

// Meniru resetPasswordSchema di server untuk feedback cepat.
function validate(newPassword: string, confirmPassword: string): Errors {
  const errors: Errors = {};
  if (newPassword.length < 8)
    errors.newPassword = "Password baru minimal 8 karakter";
  if (!confirmPassword) errors.confirmPassword = "Konfirmasi password wajib diisi";
  else if (confirmPassword !== newPassword)
    errors.confirmPassword = "Password dan konfirmasi tidak cocok";
  return errors;
}

export default function ResetPasswordForm({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: keyof Errors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(newPassword, confirmPassword);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    await submit(
      () =>
        fetch("/esurat/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            token,
            newPassword,
            confirmPassword,
          }),
        }),
      {
        successMessage: "Kata sandi berhasil diatur ulang. Silakan masuk.",
        successTitle: "Password Direset",
        errorTitle: "Gagal Mereset Password",
        errorFallback: "Token tidak valid atau sudah kedaluwarsa",
        extractErrorMessage: (json) => {
          const fe = json.errors;
          if (fe)
            setErrors((prev) => ({
              newPassword: fe.newPassword?.[0] ?? prev.newPassword,
              confirmPassword: fe.confirmPassword?.[0] ?? prev.confirmPassword,
            }));
          return json.message as string | undefined;
        },
        onSuccess: () => router.push("/esurat"),
      },
    ).catch(() => {});
  };

  return (
    <AuthSplitLayout
      brandTitle={
        <>
          E-Surat
          <br />
          <em className="text-paper/80">Desa Sangkima</em>
        </>
      }
      brandDescription="Setel ulang kata sandi Anda untuk kembali mengakses layanan administrasi surat desa."
    >
      <AuthFormHeader
        overline="Pemulihan Akun"
        title="Setel ulang sandi"
        description="Masukkan kata sandi baru untuk akun Anda."
        animated
        compact
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rise-in w-full"
        style={{ animationDelay: "180ms" }}
      >
        <FormField
          id="newPassword"
          label="Password Baru"
          type="password"
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
          label="Konfirmasi Password Baru"
          type="password"
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

        <button
          type="submit"
          disabled={busy}
          className="btn-primary py-2.5 md:py-3.5 text-[15px] md:text-[16px] font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? "Menyimpan..." : "Setel Ulang Sandi"}
        </button>

        <div className="text-center text-[15px] text-inkmut">
          <Link
            href="/esurat"
            className="font-semibold text-brass hover:underline underline-offset-2"
          >
            Kembali ke Masuk
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
