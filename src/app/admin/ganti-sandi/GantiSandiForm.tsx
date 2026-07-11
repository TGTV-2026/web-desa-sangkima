"use client";

import { useState, useTransition } from "react";
import FormField from "@/components/esurat/FormField";
import { useToast } from "@/hooks/useToast";
import { gantiSandiWajib } from "./actions";

export default function GantiSandiForm() {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await gantiSandiWajib({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      // Sukses → server action me-redirect ke /admin; hanya error yang balik ke sini.
      if (res && !res.success) toast(res.message, "Gagal", "error");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormField
        id="currentPassword"
        label="Kata Sandi Sementara"
        type="password"
        value={currentPassword}
        onChange={setCurrentPassword}
        placeholder="Sandi dari admin desa"
        required
      />
      <FormField
        id="newPassword"
        label="Kata Sandi Baru"
        type="password"
        value={newPassword}
        onChange={setNewPassword}
        placeholder="Minimal 6 karakter"
        required
      />
      <FormField
        id="confirmPassword"
        label="Konfirmasi Kata Sandi Baru"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Ulangi kata sandi baru"
        required
      />
      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
        {pending ? "Menyimpan…" : "Simpan & Masuk"}
      </button>
    </form>
  );
}
