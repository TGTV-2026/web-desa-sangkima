"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthSplitLayout from "@/components/esurat/auth/AuthSplitLayout";
import AuthFormHeader from "@/components/esurat/auth/AuthFormHeader";
import FormField from "@/components/esurat/FormField";
import { useSubmitAction, type SubmitActionError } from "@/hooks/useSubmitAction";

// ─── Aturan validasi (selaras dengan Zod schema di server) ─────────────────
function validateField(field: string, value: string, allValues?: { password?: string }): string {
  switch (field) {
    case "name":
      if (!value.trim()) return "Nama lengkap tidak boleh kosong";
      if (value.trim().length < 3) return "Nama minimal 3 karakter";
      return "";
    case "nik":
      if (!value) return "NIK tidak boleh kosong";
      if (!/^\d*$/.test(value)) return "NIK hanya boleh berisi angka";
      if (value.length !== 16) return "NIK harus tepat 16 digit angka";
      return "";
    case "email":
      if (!value) return "Email tidak boleh kosong";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email tidak valid (contoh: nama@email.com)";
      return "";
    case "password":
      if (!value) return "Kata sandi tidak boleh kosong";
      if (value.length < 8) return "Kata sandi minimal 8 karakter";
      return "";
    case "confirmPassword":
      if (!value) return "Konfirmasi kata sandi tidak boleh kosong";
      if (allValues?.password && value !== allValues.password)
        return "Kata sandi dan konfirmasi kata sandi tidak cocok";
      return "";
    default:
      return "";
  }
}

export default function RegisterForm() {
  const router = useRouter();
  const { busy: isLoading, submit } = useSubmitAction();
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Track field yang sudah pernah di-blur agar error tidak muncul saat pertama ketik
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Helper: set error untuk satu field
  const setError = (field: string, msg: string) =>
    setFieldErrors((prev) => ({ ...prev, [field]: msg }));

  // Handler blur – validasi saat user meninggalkan field
  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value, { password });
    setError(field, err);

    // Jika blur di password dan confirmPassword sudah diisi, validasi ulang cocok/tidak
    if (field === "password" && confirmPassword && touched.confirmPassword) {
      setError("confirmPassword", validateField("confirmPassword", confirmPassword, { password: value }));
    }
  };

  // Validasi semua field sekaligus (saat submit)
  const validateAll = (): boolean => {
    const errors: Record<string, string> = {};
    errors.name = validateField("name", name);
    errors.nik = validateField("nik", nik);
    errors.email = validateField("email", email);
    errors.password = validateField("password", password);
    errors.confirmPassword = validateField("confirmPassword", confirmPassword, { password });

    // Hapus key yang kosong (valid)
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(errors)) {
      if (v) filtered[k] = v;
    }
    setFieldErrors(filtered);
    // Tandai semua field sebagai touched
    setTouched({ name: true, nik: true, email: true, password: true, confirmPassword: true });
    return Object.keys(filtered).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi client-side menyeluruh
    if (!validateAll()) return;

    try {
      await submit(
        () =>
          fetch("/esurat/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, nik, email, password, confirmPassword }),
          }),
        {
          successMessage: "Pendaftaran berhasil. Silahkan verifikasi kode OTP yang dikirimkan.",
          successTitle: "Akun Terdaftar",
          errorTitle: "Gagal Daftar",
          errorFallback: "Gagal mendaftarkan akun Anda",
          // Logika menangkap error validasi berlapis (Zod) dari backend: pesan toast
          // memprioritaskan error field pertama, bukan pesan generik.
          extractErrorMessage: (json) => {
            if (!json.errors) return undefined;
            const firstField = Object.keys(json.errors)[0];
            return json.errors[firstField]?.[0] ?? json.message;
          },
          onSuccess: () => {
            // Status "menunggu verifikasi" sudah ditandai server lewat cookie httpOnly
            // (tahan tab tertutup), jadi tidak perlu menyimpan userId di sessionStorage.
            setTimeout(() => {
              router.push("/esurat/verify-otp");
            }, 1500);
          },
        },
      );
    } catch (err) {
      // Tampilkan border merah + keterangan pada field yang tepat
      const json = (err as SubmitActionError).json;
      if (json?.errors) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(json.errors)) {
          const firstMsg = Array.isArray(messages) ? messages[0] : undefined;
          if (firstMsg) mapped[field] = firstMsg;
        }
        setFieldErrors(mapped);
      }
    }
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
      brandDescription="Layanan administrasi surat-menyurat resmi bagi warga — ajukan dari rumah, pantau prosesnya, dan terima surat bertanda tangan dengan kode verifikasi."
      scrollableForm
    >
      <AuthFormHeader
        overline="Layanan Warga"
        title="Daftar Akun Baru"
        description="Lengkapi data diri Anda sesuai dengan KTP untuk mendaftar sistem layanan surat."
        animated
        compact
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-1.5 md:gap-2 lg:gap-2.5 rise-in w-full"
        style={{ animationDelay: "180ms" }}
      >
        <FormField
          id="name"
          label="Nama Lengkap"
          value={name}
          onChange={(val) => {
            setName(val);
            if (fieldErrors.name) setError("name", validateField("name", val));
          }}
          onBlur={() => handleBlur("name", name)}
          error={fieldErrors.name}
          placeholder="Masukkan nama lengkap sesuai KTP"
          required
          autoComplete="name"
        />

        <FormField
          id="nik"
          label="NIK (Nomor Induk Kependudukan)"
          value={nik}
          onChange={(val) => {
            // Hanya terima angka
            const filtered = val.replace(/\D/g, "");
            setNik(filtered);
            if (fieldErrors.nik)
              setError("nik", validateField("nik", filtered));
          }}
          onBlur={() => handleBlur("nik", nik)}
          error={fieldErrors.nik}
          placeholder="16 digit nomor NIK Anda"
          required
          maxLength={16}
          autoComplete="off"
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(val) => {
            setEmail(val);
            if (fieldErrors.email)
              setError("email", validateField("email", val));
          }}
          onBlur={() => handleBlur("email", email)}
          error={fieldErrors.email}
          placeholder="nama@contoh.com"
          required
          autoComplete="email"
        />

        <div className="grid grid-cols-2 gap-2 md:gap-3 w-full">
          <FormField
            id="password"
            label="Kata Sandi"
            type="password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              if (fieldErrors.password)
                setError("password", validateField("password", val));
              if (confirmPassword && touched.confirmPassword) {
                setError(
                  "confirmPassword",
                  validateField("confirmPassword", confirmPassword, {
                    password: val,
                  }),
                );
              }
            }}
            onBlur={() => handleBlur("password", password)}
            error={fieldErrors.password}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />

          <FormField
            id="confirmPassword"
            label="Konfirmasi Kata Sandi"
            type="password"
            value={confirmPassword}
            onChange={(val) => {
              setConfirmPassword(val);
              if (fieldErrors.confirmPassword) {
                setError(
                  "confirmPassword",
                  validateField("confirmPassword", val, { password }),
                );
              }
            }}
            onBlur={() => handleBlur("confirmPassword", confirmPassword)}
            error={fieldErrors.confirmPassword}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary mt-1 md:mt-2 py-2 md:py-3.5 text-[15px] md:text-[16px] font-semibold w-full"
        >
          {isLoading ? "Memproses..." : "Daftar Sekarang"}
        </button>

        <div className="border-t border-line pt-2 md:pt-3 mt-0.5 text-center text-[15px] md:text-[16px] text-inkmut w-full">
          Sudah memiliki akun?{" "}
          <Link
            href="/esurat"
            className="font-semibold text-brass hover:underline underline-offset-2"
          >
            Masuk ke akun Anda
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
