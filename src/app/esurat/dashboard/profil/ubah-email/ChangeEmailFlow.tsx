"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import FormField from "@/components/esurat/FormField";

// Meniru aturan email Zod di server (changeEmailSchema) untuk feedback cepat.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateNewEmail(value: string, currentEmail: string): string {
  const v = value.trim();
  if (!v) return "Email baru wajib diisi";
  if (!EMAIL_RE.test(v)) return "Format email tidak valid (contoh: nama@email.com)";
  if (v.toLowerCase() === currentEmail.toLowerCase())
    return "Email baru sama dengan email lama Anda";
  return "";
}

export default function ChangeEmailFlow({
  currentEmail,
}: {
  currentEmail: string;
}) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();

  const [step, setStep] = useState<"input" | "otp">("input");
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
  const [otpError, setOtpError] = useState("");
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer berjalan terus, tapi hanya menghitung mundur saat > 0 (pola VerifyOtpForm).
  useEffect(() => {
    const id = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  // ponytail: pola OTP box disalin dari VerifyOtpForm; ekstrak ke <OtpInput> kalau muncul pemakaian ke-3
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const lastChar = element.value.slice(-1);
    if (lastChar && isNaN(Number(lastChar))) return;
    const next = [...otp];
    next[index] = lastChar;
    setOtp(next);
    if (otpError) setOtpError("");
    if (element.value !== "" && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const goToOtpStep = () => {
    setOtp(new Array(4).fill(""));
    setOtpError("");
    setStep("otp");
    setTimer(60);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateNewEmail(newEmail, currentEmail);
    setEmailError(err);
    if (err) return;

    await submit(
      () =>
        fetch("/esurat/api/auth/change-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newEmail: newEmail.trim() }),
        }),
      {
        successMessage: `Kode 4 digit telah dikirim ke ${newEmail.trim()}.`,
        successTitle: "Kode Terkirim",
        errorTitle: "Gagal Mengirim Kode",
        errorFallback: "Gagal mengirim kode ke email baru",
        extractErrorMessage: (json) => {
          const fieldMsg = json.errors?.newEmail?.[0];
          const inline = fieldMsg ?? (json.message as string | undefined);
          if (inline) setEmailError(inline);
          return fieldMsg; // kalau bukan error field, hook pakai json.message untuk toast
        },
        onSuccess: goToOtpStep,
      },
    ).catch(() => {});
  };

  const handleResend = async () => {
    if (timer > 0 || busy) return;
    await submit(
      () =>
        fetch("/esurat/api/auth/change-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newEmail: newEmail.trim() }),
        }),
      {
        successMessage: `Kode baru telah dikirim ke ${newEmail.trim()}.`,
        successTitle: "Kode Terkirim",
        errorTitle: "Gagal Mengirim Ulang",
        errorFallback: "Gagal mengirim ulang kode",
        onSuccess: () => {
          setOtp(new Array(4).fill(""));
          setOtpError("");
          setTimer(60);
        },
      },
    ).catch(() => {});
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) return;

    await submit(
      () =>
        fetch("/esurat/api/auth/verify-email-change", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: code }),
        }),
      {
        successMessage: `Email akun Anda berhasil diubah menjadi ${newEmail.trim()}.`,
        successTitle: "Email Diubah",
        errorTitle: "Verifikasi Gagal",
        errorFallback: "Kode yang dimasukkan tidak valid",
        extractErrorMessage: (json) => {
          const msg = json.errors?.otp?.[0] ?? (json.message as string | undefined);
          if (msg) setOtpError(msg);
          return json.errors?.otp?.[0];
        },
        onSuccess: () => {
          // Kembali ke profil; Server Component baca email terbaru dari DB.
          router.push("/esurat/dashboard/profil");
          router.refresh();
        },
      },
    ).catch(() => {});
  };

  const cardCls =
    "card-doc p-5 sm:p-7 md:p-8 bg-paper border border-line/70 rounded-sm shadow-sm flex flex-col gap-5 text-ink";

  if (step === "input") {
    return (
      <form onSubmit={handleSendCode} className={cardCls}>
        <div>
          <label className="label-doc">Email Saat Ini</label>
          <input
            type="text"
            value={currentEmail}
            readOnly
            className="input-doc mt-1.5 bg-paper2/50 text-inkmut cursor-not-allowed"
          />
        </div>

        <FormField
          id="newEmail"
          type="email"
          label="Email Baru"
          value={newEmail}
          onChange={(val) => {
            setNewEmail(val);
            if (emailError) setEmailError("");
          }}
          onBlur={() => setEmailError(validateNewEmail(newEmail, currentEmail))}
          placeholder="Contoh: nama@email.com"
          autoComplete="email"
          required
          error={emailError}
        />

        <p className="text-[14px] text-inkmut leading-relaxed -mt-1">
          Kami akan mengirim <strong>4 digit kode</strong> ke email baru Anda.
          Buka email tersebut untuk melanjutkan.
        </p>

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
            {busy ? "Mengirim Kode..." : "Kirim Kode"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className={cardCls}>
      <p className="text-[15px] text-ink leading-relaxed">
        Kami telah mengirim 4 digit kode ke{" "}
        <span className="font-semibold">{newEmail.trim()}</span>. Buka email
        tersebut, lalu masukkan kodenya di bawah ini.
      </p>

      <div>
        <label className="label-doc mb-2">Kode Verifikasi</label>
        <div className="flex justify-between gap-1.5 sm:gap-2 w-full">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
              }}
              value={digit}
              onChange={(e) => handleOtpChange(e.target, index)}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              className="w-full h-12 sm:h-14 lg:h-16 text-center text-xl sm:text-2xl font-serif font-bold bg-white border border-line rounded-sm focus:border-pine-900 focus:ring-1 focus:ring-pine-900 outline-none transition-all"
            />
          ))}
        </div>
        {otpError && <p className="text-xs text-oxide mt-2">{otpError}</p>}
      </div>

      <button
        type="submit"
        disabled={busy || otp.includes("")}
        className="btn-primary w-full shadow-sm py-3 px-4 font-bold tracking-wide uppercase text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "Memverifikasi..." : "Verifikasi & Simpan"}
      </button>

      <div className="text-center">
        <p className="text-xs text-inkmut mb-1.5">Tidak menerima kode?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || busy}
          className={`text-xs font-bold tracking-wider uppercase transition-colors ${
            timer > 0 || busy
              ? "text-inkmut/40"
              : "text-brass hover:underline"
          }`}
        >
          {timer > 0 ? `Kirim Ulang dalam (${timer}s)` : "Kirim Ulang Kode"}
        </button>
      </div>

      <div className="border-t border-line/50 pt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setStep("input");
            setOtpError("");
          }}
          className="text-xs font-semibold text-inkmut hover:text-ink underline underline-offset-2"
        >
          ← Ganti email lain
        </button>
      </div>
    </form>
  );
}
