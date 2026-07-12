"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/esurat/FormField";
import { useToast } from "@/hooks/useToast";
import {
  changeMyPassword,
  requestMyEmailChange,
  verifyMyEmailChange,
} from "./actions";

export default function AkunForms({ currentEmail }: { currentEmail: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Ganti email — dua tahap: minta OTP, lalu verifikasi.
  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);

  // Ganti kata sandi.
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function mintaOtp() {
    startTransition(async () => {
      const res = await requestMyEmailChange({
        currentPassword: emailPassword,
        newEmail,
      });
      if (res.success) {
        setOtpSentTo(newEmail);
        setEmailPassword("");
        toast(res.message, "Kode terkirim", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  function verifikasiOtp() {
    startTransition(async () => {
      const res = await verifyMyEmailChange({ otp });
      if (res.success) {
        setOtpSentTo(null);
        setNewEmail("");
        setOtp("");
        toast(res.message, "Email diperbarui", "success");
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  function batalGantiEmail() {
    setOtpSentTo(null);
    setOtp("");
  }

  function gantiSandi() {
    startTransition(async () => {
      const res = await changeMyPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        toast(res.message, "Tersimpan", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="card-doc flex flex-col gap-4 p-6">
        <div>
          <span className="label-doc">Ganti Email</span>
          <p className="mt-1 text-[11px] text-inkmut">
            Email saat ini: <span className="font-semibold text-ink">{currentEmail}</span>.
            Kode OTP dikirim ke email baru dulu — email hanya ditukar setelah kode
            itu diverifikasi.
          </p>
        </div>

        {otpSentTo ? (
          <>
            <p className="rounded-sm border border-line bg-paper2/40 px-3 py-2 text-sm text-ink">
              Kode OTP dikirim ke{" "}
              <span className="font-semibold">{otpSentTo}</span>. Berlaku 15 menit.
            </p>
            <FormField
              id="otp"
              label="Kode OTP (4 angka)"
              value={otp}
              onChange={setOtp}
              placeholder="1234"
              autoComplete="one-time-code"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={verifikasiOtp}
                disabled={pending || otp.trim().length !== 4}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {pending ? "Memverifikasi…" : "Verifikasi & Ganti Email"}
              </button>
              <button
                type="button"
                onClick={batalGantiEmail}
                disabled={pending}
                className="btn-outline text-sm disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </>
        ) : (
          <>
            <FormField
              id="newEmail"
              label="Email baru"
              type="email"
              value={newEmail}
              onChange={setNewEmail}
              placeholder="admin@sangkima.desa.id"
              autoComplete="off"
            />
            <FormField
              id="emailPassword"
              label="Kata sandi saat ini"
              type="password"
              value={emailPassword}
              onChange={setEmailPassword}
              placeholder="untuk memastikan ini benar Anda"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={mintaOtp}
              disabled={pending || !newEmail.trim() || !emailPassword}
              className="btn-primary self-start text-sm disabled:opacity-50"
            >
              {pending ? "Mengirim…" : "Kirim Kode OTP"}
            </button>
          </>
        )}
      </section>

      <section className="card-doc flex flex-col gap-4 p-6">
        <div>
          <span className="label-doc">Ganti Kata Sandi</span>
          <p className="mt-1 text-[11px] text-inkmut">
            Minimal 6 karakter. Lupa kata sandi saat ini? Keluar lalu pakai
            &ldquo;Lupa kata sandi&rdquo; di halaman masuk.
          </p>
        </div>
        <FormField
          id="currentPassword"
          label="Kata sandi saat ini"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
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
          onClick={gantiSandi}
          disabled={pending || !currentPassword || !newPassword || !confirmPassword}
          className="btn-primary self-start text-sm disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Simpan Kata Sandi Baru"}
        </button>
      </section>
    </div>
  );
}
