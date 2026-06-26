"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import AuthSplitLayout from "@/components/esurat/auth/AuthSplitLayout";
import AuthFormHeader from "@/components/esurat/auth/AuthFormHeader";
import FormField from "@/components/esurat/FormField";
import Turnstile from "@/components/esurat/Turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const { busy, submit } = useSubmitAction();
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sent, setSent] = useState(false);
  // Hanya terisi di mode dev (EMAIL_MODE=console) — link langsung untuk uji coba.
  const [devUrl, setDevUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim();
    if (!EMAIL_RE.test(v)) {
      setEmailError("Format email tidak valid (contoh: nama@email.com)");
      return;
    }
    setEmailError("");

    await submit(
      () =>
        fetch("/esurat/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: v, turnstileToken }),
        }),
      {
        successMessage: "Jika email terdaftar, link reset telah dikirim.",
        successTitle: "Permintaan Diterima",
        errorTitle: "Gagal Memproses",
        errorFallback: "Gagal memproses permintaan reset password",
        extractErrorMessage: (json) => {
          const fieldMsg = json.errors?.email?.[0];
          if (fieldMsg) setEmailError(fieldMsg);
          return fieldMsg ?? (json.message as string | undefined);
        },
        onSuccess: (json) => {
          setSent(true);
          const dev = (json as { _dev?: { resetUrl?: string } })._dev;
          if (dev?.resetUrl) setDevUrl(dev.resetUrl);
        },
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
      brandDescription="Lupa kata sandi? Masukkan email terdaftar Anda, kami akan mengirimkan link untuk menyetel ulang sandi."
    >
      <AuthFormHeader
        overline="Pemulihan Akun"
        title="Lupa kata sandi"
        description="Masukkan email yang terdaftar. Kami akan mengirim link untuk menyetel ulang kata sandi Anda."
        animated
        compact
      />

      {sent ? (
        <div
          className="card-doc p-5 sm:p-6 bg-paper border border-line/70 rounded-sm flex flex-col gap-4 text-ink rise-in w-full"
          style={{ animationDelay: "180ms" }}
        >
          <p className="text-[15px] leading-relaxed">
            Jika <span className="font-semibold">{email.trim()}</span> terdaftar,
            kami telah mengirim link reset kata sandi ke email tersebut. Periksa
            kotak masuk (dan folder spam) Anda.
          </p>

          {devUrl && (
            <div className="border-t border-line/50 pt-3">
              <p className="text-xs text-inkmut mb-1.5 uppercase tracking-wider font-bold">
                Mode Dev — Link Langsung
              </p>
              <Link
                href={devUrl.replace(/^https?:\/\/[^/]+/, "")}
                className="text-sm text-brass hover:underline break-all"
              >
                {devUrl}
              </Link>
            </div>
          )}

          <Link
            href="/esurat"
            className="btn-outline w-full text-center py-3 px-5 font-bold tracking-wide uppercase text-xs"
          >
            Kembali ke Masuk
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rise-in w-full"
          style={{ animationDelay: "180ms" }}
        >
          <FormField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(val) => {
              setEmail(val);
              if (emailError) setEmailError("");
            }}
            placeholder="nama@contoh.com"
            autoComplete="email"
            required
            error={emailError}
          />

          <Turnstile onVerify={setTurnstileToken} />

          <button
            type="submit"
            disabled={busy || !turnstileToken}
            className="btn-primary py-2.5 md:py-3.5 text-[15px] md:text-[16px] font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? "Mengirim..." : "Kirim Link Reset"}
          </button>

          <div className="text-center text-[15px] text-inkmut">
            Ingat kata sandi Anda?{" "}
            <Link
              href="/esurat"
              className="font-semibold text-brass hover:underline underline-offset-2"
            >
              Kembali ke Masuk
            </Link>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
}
