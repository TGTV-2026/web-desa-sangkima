"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import AuthSplitLayout from "@/components/esurat/auth/AuthSplitLayout";
import AuthFormHeader from "@/components/esurat/auth/AuthFormHeader";
import FormField from "@/components/esurat/FormField";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/esurat/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Email belum diverifikasi: server sudah menandai sesi pending,
        // tinggal arahkan user ke halaman verifikasi OTP.
        if (data.code === "EMAIL_NOT_VERIFIED") {
          toast(
            "Email Anda belum diverifikasi. Mengalihkan ke halaman verifikasi...",
            "Verifikasi Diperlukan",
            "info",
            4000,
          );
          setTimeout(() => {
            router.push("/esurat/verify-otp");
          }, 1000);
          return;
        }
        if (response.status === 400 && data.errors) {
          const firstField = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstField]?.[0] ?? data.message;
          throw new Error(firstMsg || "Data yang dimasukkan tidak valid");
        }
        throw new Error(data.message || "Gagal masuk ke akun Anda");
      }

      toast(
        "Selamat datang kembali. Mengalihkan ke dasbor...",
        "Berhasil Masuk",
        "success",
        4000,
      );
      setTimeout(() => {
        router.push("/esurat/dashboard");
      }, 1000);
    } catch (err: any) {
      const msg = err?.message || "Gagal terhubung ke server";
      toast(msg, "Gagal Masuk", "error", 5000);
    } finally {
      setIsLoading(false);
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
    >
      <AuthFormHeader
        overline="Layanan Warga"
        title="Masuk ke akun Anda"
        description="Gunakan email dan kata sandi yang terdaftar di kantor desa."
        animated
      />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rise-in"
        style={{ animationDelay: "180ms" }}
      >
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="nama@contoh.com"
          required
          autoComplete="email"
        />

        <FormField
          id="password"
          label="Kata Sandi"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          labelAction={
            <a
              href="/forgot-password"
              className="text-xs font-semibold text-brass hover:underline underline-offset-2"
            >
              Lupa sandi?
            </a>
          }
        />

        <button type="submit" disabled={isLoading} className="btn-primary mt-2">
          {isLoading ? "Memproses..." : "Masuk"}
        </button>

        <div className="border-t border-line pt-5 text-center text-xs text-inkmut">
          Belum punya akun?{" "}
          <a
            href="/esurat/register"
            className="font-semibold text-brass hover:underline underline-offset-2"
          >
            Daftar sebagai warga
          </a>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
