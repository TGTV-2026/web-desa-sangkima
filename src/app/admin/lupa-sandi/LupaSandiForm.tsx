"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/esurat/FormField";
import { useToast } from "@/hooks/useToast";
import { requestCmsPasswordReset, resetCmsPassword } from "./actions";

export default function LupaSandiForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function kirimOtp() {
    startTransition(async () => {
      const res = await requestCmsPasswordReset({ email });
      if (res.success) {
        setStep("otp");
        toast(res.message, "Cek email Anda", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  function aturUlang() {
    startTransition(async () => {
      const res = await resetCmsPassword({
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        toast(`${res.message} Silakan masuk.`, "Berhasil", "success");
        router.push("/admin/login");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  if (step === "email") {
    return (
      <div className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email akun CMS Anda"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="admin@sangkima.desa.id"
        />
        <button
          type="button"
          onClick={kirimOtp}
          disabled={pending || !email.trim()}
          className="btn-primary w-full disabled:opacity-50"
        >
          {pending ? "Mengirim…" : "Kirim Kode OTP"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-sm border border-line bg-paper2/40 px-3 py-2 text-sm text-ink">
        Kode OTP dikirim ke <span className="font-semibold">{email}</span>.
        Berlaku 15 menit.
      </p>
      <FormField
        id="otp"
        label="Kode OTP (4 angka)"
        value={otp}
        onChange={setOtp}
        placeholder="1234"
        autoComplete="one-time-code"
      />
      <FormField
        id="newPassword"
        label="Kata sandi baru"
        type="password"
        value={newPassword}
        onChange={setNewPassword}
        placeholder="minimal 6 karakter"
        autoComplete="new-password"
      />
      <FormField
        id="confirmPassword"
        label="Ulangi kata sandi baru"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={aturUlang}
        disabled={pending || !otp.trim() || !newPassword || !confirmPassword}
        className="btn-primary w-full disabled:opacity-50"
      >
        {pending ? "Menyimpan…" : "Atur Ulang Kata Sandi"}
      </button>
      <button
        type="button"
        onClick={() => setStep("email")}
        disabled={pending}
        className="text-xs text-inkmut hover:text-pine-900 disabled:opacity-50"
      >
        ← Ganti email
      </button>
    </div>
  );
}
