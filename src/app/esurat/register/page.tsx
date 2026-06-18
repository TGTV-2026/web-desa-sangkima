"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});

    // Pastikan konfirmasi password cocok sebelum dikirim ke server
    if (password !== confirmPassword) {
      setFieldErrors({
        confirmPassword: "Password dan konfirmasi password tidak cocok",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/esurat/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nik, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Logika menangkap error validasi berlapis (Zod) dari backend, lalu
        // tampilkan sebagai border merah + keterangan pada field yang tepat
        if (response.status === 400 && data.errors) {
          const mapped: Record<string, string> = {};
          for (const [field, messages] of Object.entries(data.errors)) {
            const firstMsg = Array.isArray(messages) ? messages[0] : undefined;
            if (firstMsg) mapped[field] = firstMsg;
          }
          setFieldErrors(mapped);

          const firstField = Object.keys(data.errors)[0];
          const firstMsg = data.errors[firstField]?.[0] ?? data.message;
          throw new Error(firstMsg || "Data pendaftaran tidak valid");
        }
        throw new Error(data.message || "Gagal mendaftarkan akun Anda");
      }

      toast(
        "Pendaftaran berhasil. Silahkan verifikasi kode OTP yang dikirimkan.",
        "Akun Terdaftar",
        "success",
        4000,
      );

      // Status "menunggu verifikasi" sudah ditandai server lewat cookie httpOnly
      // (tahan tab tertutup), jadi tidak perlu menyimpan userId di sessionStorage.
      setTimeout(() => {
        router.push("/esurat/verify-otp");
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Gagal terhubung ke server";
      toast(msg, "Gagal Daftar", "error", 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* ---------- Panel institusional (kiri) ---------- */}
      <section className="relative hidden lg:flex flex-col justify-between bg-pine-900 text-paper overflow-hidden px-14 py-12">
        {/* bingkai dokumen */}
        <div className="absolute inset-4 border border-paper/15 rounded-sm pointer-events-none" />
        {/* monogram raksasa samar */}
        <span
          aria-hidden
          className="absolute -bottom-24 -right-6 font-serif italic text-[24rem] leading-none text-paper/[0.045] select-none pointer-events-none"
        >
          S
        </span>

        <header className="relative rise-in">
          <p className="overline-doc !text-paper/50">
            Pemerintah Kabupaten Kutai Timur
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/50 mt-1">
            Kecamatan Sangatta Selatan
          </p>
        </header>

        <div className="relative rise-in" style={{ animationDelay: "120ms" }}>
          {/* segel desa */}
          <div className="relative w-16 h-16 rounded-full border border-paper/40 grid place-items-center mb-8">
            <div className="absolute inset-[5px] rounded-full border border-paper/25" />
            <span className="font-serif font-semibold text-xl tracking-tight">
              DS
            </span>
          </div>

          <h1 className="font-serif text-6xl font-medium tracking-tight leading-[1.05]">
            E-Surat
            <br />
            <em className="text-paper/80">Desa Sangkima</em>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/65">
            Layanan administrasi surat-menyurat resmi bagi warga — ajukan dari
            rumah, pantau prosesnya, dan terima surat bertanda tangan dengan
            kode verifikasi.
          </p>
        </div>

        <footer
          className="relative rise-in text-[11px] tracking-[0.08em] uppercase text-paper/40"
          style={{ animationDelay: "240ms" }}
        >
          Jl. Poros Sangatta–Bontang · Desa Sangkima · Kalimantan Timur
        </footer>
      </section>

      {/* ---------- Form pendaftaran (kanan) ---------- */}
      <section className="flex flex-col justify-center px-6 py-6 sm:px-12 lg:px-16 xl:px-24 bg-paper h-full overflow-y-auto">
        {/* kop ringkas untuk layar kecil */}
        <header className="lg:hidden mb-10 rise-in">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full border border-ink/40 grid place-items-center shrink-0">
              <div className="absolute inset-[4px] rounded-full border border-ink/20" />
              <span className="font-serif font-semibold text-sm">DS</span>
            </div>
            <div>
              <p className="font-serif text-xl font-medium leading-tight">
                E-Surat Desa Sangkima
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-inkmut">
                Kab. Kutai Timur · Kec. Sangatta Selatan
              </p>
            </div>
          </div>
        </header>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <p className="overline-doc rise-in">Layanan Warga</p>
          <h2
            className="font-serif text-4xl font-medium tracking-tight mt-2 rise-in"
            style={{ animationDelay: "60ms" }}
          >
            Daftar Akun Baru
          </h2>
          <p
            className="text-sm text-inkmut mt-1 mb-4 rise-in"
            style={{ animationDelay: "120ms" }}
          >
            Lengkapi data diri Anda sesuai dengan KTP untuk mendaftar sistem layanan surat.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rise-in"
            style={{ animationDelay: "180ms" }}
          >
            <div>
              <label htmlFor="name" className="label-doc">
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                placeholder="Masukkan nama lengkap sesuai KTP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-doc"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="nik" className="label-doc">
                NIK (Nomor Induk Kependudukan)
              </label>
              <input
                type="text"
                id="nik"
                placeholder="16 digit nomor NIK Anda"
                maxLength={16}
                value={nik}
                onChange={(e) => {
                  setNik(e.target.value);
                  if (fieldErrors.nik) setFieldErrors((prev) => ({ ...prev, nik: "" }));
                }}
                required
                className={`input-doc ${fieldErrors.nik ? "!border-oxide focus:!border-oxide focus:!ring-oxide/15" : ""}`}
                autoComplete="off"
              />
              {fieldErrors.nik && (
                <p className="text-xs text-oxide mt-1.5">{fieldErrors.nik}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label-doc">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                required
                className={`input-doc ${fieldErrors.email ? "!border-oxide focus:!border-oxide focus:!ring-oxide/15" : ""}`}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-xs text-oxide mt-1.5">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label-doc">
                Kata Sandi
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  // Hapus error jika keduanya sudah cocok, atau kosongkan error password
                  setFieldErrors((prev) => ({
                    ...prev,
                    password: "",
                    confirmPassword:
                      confirmPassword && val !== confirmPassword
                        ? "Kata sandi dan konfirmasi kata sandi tidak cocok"
                        : "",
                  }));
                }}
                required
                className={`input-doc ${fieldErrors.confirmPassword ? "!border-oxide focus:!border-oxide focus:!ring-oxide/15" : ""}`}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-oxide mt-1.5">Kata sandi tidak cocok dengan konfirmasi</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-doc">
                Konfirmasi Kata Sandi
              </label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfirmPassword(val);
                  // Validasi real-time: tampil error segera jika tidak cocok
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword:
                      val && password && val !== password
                        ? "Kata sandi dan konfirmasi kata sandi tidak cocok"
                        : "",
                  }));
                }}
                required
                className={`input-doc ${fieldErrors.confirmPassword ? "!border-oxide focus:!border-oxide focus:!ring-oxide/15" : ""}`}
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-oxide mt-1.5">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary mt-2">
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </button>

            <div className="border-t border-line pt-5 text-center text-xs text-inkmut">
              Sudah memiliki akun?{" "}
              <a
                href="/"
                className="font-semibold text-brass hover:underline underline-offset-2"
              >
                Masuk ke akun Anda
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}