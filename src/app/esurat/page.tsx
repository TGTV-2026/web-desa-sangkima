"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export default function LoginPage() {
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
    <main className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
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

      {/* ---------- Form masuk (kanan) ---------- */}
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-paper">
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
            Masuk ke akun Anda
          </h2>
          <p
            className="text-sm text-inkmut mt-3 mb-10 rise-in"
            style={{ animationDelay: "120ms" }}
          >
            Gunakan email dan kata sandi yang terdaftar di kantor desa.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rise-in"
            style={{ animationDelay: "180ms" }}
          >
            <div>
              <label htmlFor="email" className="label-doc">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="nama@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-doc"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-2">
                <label htmlFor="password" className="label-doc !mb-0">
                  Kata Sandi
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs font-semibold text-brass hover:underline underline-offset-2"
                >
                  Lupa sandi?
                </a>
              </div>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-doc"
                autoComplete="current-password"
              />
            </div>

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
        </div>
      </section>
    </main>
  );
}
