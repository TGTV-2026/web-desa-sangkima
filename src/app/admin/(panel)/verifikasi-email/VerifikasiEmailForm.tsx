"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/esurat/FormField";
import { useToast } from "@/hooks/useToast";
import { requestMyEmailVerification, verifyMyEmail } from "./actions";

export default function VerifikasiEmailForm({ email }: { email: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [terkirim, setTerkirim] = useState(false);
  const [otp, setOtp] = useState("");

  function kirimOtp() {
    startTransition(async () => {
      const res = await requestMyEmailVerification();
      if (res.success) {
        setTerkirim(true);
        toast(res.message, "Kode terkirim", "success");
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  function verifikasi() {
    startTransition(async () => {
      const res = await verifyMyEmail({ otp });
      if (res.success) {
        toast(res.message, "Terverifikasi", "success");
        router.push("/admin");
        router.refresh();
      } else {
        toast(res.message, "Gagal", "error");
      }
    });
  }

  return (
    <section className="card-doc flex flex-col gap-4 p-6">
      <div>
        <span className="label-doc">Verifikasi Email</span>
        <p className="mt-1 text-sm text-inkmut">
          Kode OTP akan dikirim ke{" "}
          <span className="font-semibold text-ink">{email}</span>. Selama email
          belum diverifikasi, Anda hanya bisa melihat isi CMS tanpa bisa
          mengubahnya.
        </p>
      </div>

      {!terkirim ? (
        <button
          type="button"
          onClick={kirimOtp}
          disabled={pending}
          className="btn-primary self-start text-sm disabled:opacity-50"
        >
          {pending ? "Mengirim…" : "Kirim Kode OTP"}
        </button>
      ) : (
        <>
          <p className="rounded-sm border border-line bg-paper2/40 px-3 py-2 text-sm text-ink">
            Kode dikirim ke <span className="font-semibold">{email}</span>.
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={verifikasi}
              disabled={pending || otp.trim().length !== 4}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {pending ? "Memverifikasi…" : "Verifikasi Email"}
            </button>
            <button
              type="button"
              onClick={kirimOtp}
              disabled={pending}
              className="btn-outline text-sm disabled:opacity-50"
            >
              Kirim Ulang
            </button>
          </div>
        </>
      )}

      <p className="text-[11px] text-inkmut">
        Email di atas salah? Ganti lewat menu{" "}
        <span className="font-semibold">Akun Saya</span> — verifikasi OTP ke email
        baru sekaligus mengaktifkan akun Anda.
      </p>
    </section>
  );
}
