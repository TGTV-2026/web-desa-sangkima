"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

type VerifyOtpFormProps = {
  userId: string;
  email: string;
};

export default function VerifyOtpForm({ userId, email }: VerifyOtpFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
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

    setIsResending(true);
    try {
      const response = await fetch("/esurat/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim ulang kode OTP");
      }

      setTimer(60);
      toast(
        "Kode OTP baru telah dikirimkan ke email Anda.",
        "Email Terkirim",
        "success",
        4000,
      );
    } catch (err: any) {
      const msg = err?.message || "Gagal terhubung ke server";
      toast(msg, "Gagal Kirim Ulang", "error", 5000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* ---------- Panel institusional (kiri) ---------- */}
      <section className="relative hidden lg:flex flex-col justify-between bg-pine-900 text-paper overflow-hidden px-14 py-12">
        <div className="absolute inset-4 border border-paper/15 rounded-sm pointer-events-none" />
        <span className="absolute -bottom-24 -right-6 font-serif italic text-[24rem] leading-none text-paper/[0.045] select-none pointer-events-none">
          S
        </span>

        <header className="relative">
          <p className="overline-doc !text-paper/50">
            Pemerintah Kabupaten Kutai Timur
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/50 mt-1">
            Kecamatan Sangatta Selatan
          </p>
        </header>

        <div className="relative">
          <div className="relative w-16 h-16 rounded-full border border-paper/40 grid place-items-center mb-8 font-serif font-semibold text-xl">
            DS
          </div>
          <h1 className="font-serif text-6xl font-medium tracking-tight leading-[1.05]">
            Verifikasi
            <br />
            <em className="text-paper/80">Keamanan</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/65">
            Demi menjaga keamanan data kependudukan, masukkan kode unik yang
            dikirimkan ke email Anda untuk melanjutkan akses layanan E-Surat.
          </p>
        </div>

        <footer className="relative text-[11px] tracking-[0.08em] uppercase text-paper/40">
          Jl. Poros Sangatta–Bontang · Desa Sangkima · Kalimantan Timur
        </footer>
      </section>

      {/* ---------- Form OTP (kanan) ---------- */}
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-paper">
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <p className="overline-doc">Tahap Akhir</p>
          <h2 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Cek Email Anda
          </h2>
          <p className="text-sm text-inkmut mt-3 mb-10">
            Kami telah mengirimkan 4 digit kode keamanan ke{" "}
            <span className="font-semibold text-ink">{email}</span>. Masukkan
            kode tersebut di bawah ini.
          </p>

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
        </div>
      </section>
    </main>
  );
}
