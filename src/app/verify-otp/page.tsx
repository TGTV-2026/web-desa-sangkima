"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  
  // State untuk 6 digit OTP
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

    // 🚀 PERBAIKAN TypeScript: Menggunakan optional chaining (?.) untuk menghindari crash objek null
    if (element.value !== "" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const otpCode = otp.join("");

    // Ambil userId yang disimpan sementara dari sessionStorage (jika diperlukan untuk verifikasi OTP)
    const pendingUserId = sessionStorage.getItem("pendingUserId");

    if (!pendingUserId) {
      toast(
        "Sesi verifikasi hilang, silakan daftar ulang.",
        "Gagal", 
        "error", 
        5000);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: pendingUserId, 
          otp: otpCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memverifikasi kode OTP");
      }
      toast(
        "Identitas Anda telah diverifikasi. Selamat datang di Dashboard!",
        "Verifikasi Berhasil",
        "success",
        4000,
      );

      // Hapus userId sementara setelah verifikasi berhasil
      sessionStorage.removeItem("pendingUserId");
    } catch (err: any) {
      const msg = err?.message || "Gagal terhubung ke server";
      toast(msg, "Gagal Verifikasi", "error", 5000);
    }

    // Setelah proses verifikasi (baik berhasil atau gagal), tetap arahkan pengguna ke dashboard atau halaman utama
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
      toast("Kode OTP baru telah dikirimkan ke email Anda.", "Email Terkirim", "success", 4000);
    }
  };

  return (
    <main className="h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* ---------- Panel institusional (kiri) ---------- */}
      <section className="relative hidden lg:flex flex-col justify-between bg-pine-900 text-paper overflow-hidden px-14 py-12">
        <div className="absolute inset-4 border border-paper/15 rounded-sm pointer-events-none" />
        <span className="absolute -bottom-24 -right-6 font-serif italic text-[24rem] leading-none text-paper/[0.045] select-none pointer-events-none">S</span>
        
        <header className="relative">
          <p className="overline-doc !text-paper/50">Pemerintah Kabupaten Kutai Timur</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/50 mt-1">Kecamatan Sangatta Selatan</p>
        </header>

        <div className="relative">
          <div className="relative w-16 h-16 rounded-full border border-paper/40 grid place-items-center mb-8 font-serif font-semibold text-xl">DS</div>
          <h1 className="font-serif text-6xl font-medium tracking-tight leading-[1.05]">Verifikasi<br/><em className="text-paper/80">Keamanan</em></h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/65">
            Demi menjaga keamanan data kependudukan, masukkan kode unik yang dikirimkan ke email Anda untuk melanjutkan akses layanan E-Surat.
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
          <h2 className="font-serif text-4xl font-medium tracking-tight mt-2">Cek Email Anda</h2>
          <p className="text-sm text-inkmut mt-3 mb-10">
            Kami telah mengirimkan 4 digit kode keamanan ke email terdaftar. Masukkan kode tersebut di bawah ini.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Box Input OTP */}
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  // 🚀 PERBAIKAN TypeScript: Mencegah elemen null masuk ke penampung array ref
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

            <button type="submit" disabled={isLoading || otp.includes("")} className="btn-primary">
              {isLoading ? "Memverifikasi..." : "Verifikasi Sekarang"}
            </button>

            <div className="text-center">
              <p className="text-xs text-inkmut mb-2">Tidak menerima kode?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0}
                className={`text-xs font-bold tracking-wider uppercase transition-colors ${
                  timer > 0 ? "text-inkmut/40" : "text-brass hover:underline"
                }`}
              >
                {timer > 0 ? `Kirim Ulang dalam (${timer}s)` : "Kirim Ulang Kode"}
              </button>
            </div>

            <div className="border-t border-line pt-6 text-center">
              <a href="/register" className="text-xs font-semibold text-inkmut hover:text-pine-900">
                ← Kembali ke pendaftaran
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}