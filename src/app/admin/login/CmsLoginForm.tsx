"use client";

import { useState, useTransition } from "react";
import FormField from "@/components/esurat/FormField";
import { loginCms } from "./actions";

export default function CmsLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await loginCms({ email, password });
      // Sukses → server action me-redirect; hanya error yang kembali ke sini.
      if (res && !res.success) setError(res.message);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <FormField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="editor@sangkima.desa.id"
        required
        autoComplete="email"
      />
      <FormField
        id="password"
        label="Kata Sandi"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />
      {error && (
        <p className="rounded-sm border border-oxide/40 bg-oxide/5 px-3 py-2 text-sm text-oxide">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-1 w-full disabled:opacity-50"
      >
        {pending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}
