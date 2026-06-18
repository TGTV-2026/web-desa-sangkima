"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import AuthSplitLayout from "@/components/esurat/auth/AuthSplitLayout";
import AuthFormHeader from "@/components/esurat/auth/AuthFormHeader";

type VerifyOtpFormProps = {
  userId: string;
  email: string;
};

export default function VerifyOtpForm({ userId, email }: VerifyOtpFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { busy: isResending, submit: submitResend } = useSubmitAction();
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  // State untuk 4 digit OTP
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown untuk Resend OTP
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Handler input pindah otomatis ke box sebelah
  const handleChange = (element: HTMLInputElement, index: number) => {
    const rawValue = element.value;

    const lastChar = rawValue.substring(rawValue.length - 1);
    if (lastChar && isNaN(Number(lastChar))) return false;

    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    if (element.value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const otpCode = otp.join("");

    try {
      const response = await fetch("/esurat/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memverifikasi kode OTP");
      }

      toast(
        "Identitas Anda telah diverifikasi. Silakan masuk untuk melanjutkan.",
        "Verifikasi Berhasil",
        "success",
        4000,
      );

      // Email sudah aktif tapi user belum login → arahkan ke halaman masuk.
      setTimeout(() => {
        router.push("/esurat");
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Gagal terhubung ke server";
      toast(msg, "Gagal Verifikasi", "error", 5000);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    try {
      await submitResend(
        () =>
          fetch("/esurat/api/auth/resend-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }),
        {
          successMessage: "Kode OTP baru telah dikirimkan ke email Anda.",
          successTitle: "Email Terkirim",
          errorTitle: "Gagal Kirim Ulang",
          errorFallback: "Gagal mengirim ulang kode OTP",
          onSuccess: () => setTimer(60),
        },
      );
    } catch {
      // toast kegagalan sudah ditampilkan oleh useSubmitAction
    }
  };

  return (
    <AuthSplitLayout
      brandTitle={
        <>
          Verifikasi
          <br />
          <em className="text-paper/80">Keamanan</em>
        </>
      }
      brandDescription="Demi menjaga keamanan data kependudukan, masukkan kode unik yang dikirimkan ke email Anda untuk melanjutkan akses layanan E-Surat."
      showMobileHeader={false}
    >
      <AuthFormHeader
        overline="Tahap Akhir"
        title="Cek Email Anda"
        description={
          <>
            Kami telah mengirimkan 4 digit kode keamanan ke{" "}
            <span className="font-semibold text-ink">{email}</span>. Masukkan
            kode tersebut di bawah ini.
          </>
        }
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Box Input OTP */}
        <div className="flex justify-between gap-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
              }}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              className="w-full h-14 sm:h-16 text-center text-2xl font-serif font-bold bg-white border border-line rounded-sm focus:border-pine-900 focus:ring-1 focus:ring-pine-900 outline-none transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.includes("")}
          className="btn-primary"
        >
          {isLoading ? "Memverifikasi..." : "Verifikasi Sekarang"}
        </button>

        <div className="text-center">
          <p className="text-xs text-inkmut mb-2">Tidak menerima kode?</p>
          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0 || isResending}
            className={`text-xs font-bold tracking-wider uppercase transition-colors ${
              timer > 0 || isResending
                ? "text-inkmut/40"
                : "text-brass hover:underline"
            }`}
          >
            {isResending
              ? "Mengirim..."
              : timer > 0
                ? `Kirim Ulang dalam (${timer}s)`
                : "Kirim Ulang Kode"}
          </button>
        </div>

        <div className="border-t border-line pt-6 text-center">
          <a
            href="/esurat/register"
            className="text-xs font-semibold text-inkmut hover:text-pine-900"
          >
            ← Kembali ke pendaftaran
          </a>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
