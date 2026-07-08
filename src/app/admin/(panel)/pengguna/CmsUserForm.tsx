"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import FormField from "@/components/esurat/FormField";
import { CMS_ROLE_LABELS, type CmsUserDTO } from "@/server/types/cmsUser";
import { createCmsUser, updateCmsUser } from "./actions";

export default function CmsUserForm({ initial }: { initial?: CmsUserDTO }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");

  function save() {
    startTransition(async () => {
      const payload = { name, email, password };
      const res = initial
        ? await updateCmsUser(initial.id, payload)
        : await createCmsUser(payload);
      if (res && !res.success) toast(res.message, "Gagal", "error");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card-doc flex flex-col gap-4 p-6">
        <FormField
          id="name"
          label="Nama lengkap"
          value={name}
          onChange={setName}
          placeholder="mis. Andi Saputra"
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="editor@sangkima.desa.id"
          autoComplete="off"
        />
        <div>
          <span className="label-doc text-xs">Peran</span>
          <p className="mt-1 rounded-sm border border-line bg-paper2/40 px-3 py-2 text-sm text-ink">
            {initial ? CMS_ROLE_LABELS[initial.role] : "Editor"}
            <span className="ml-2 text-[11px] text-inkmut">
              {initial
                ? "(peran tidak dapat diubah)"
                : "— akun baru selalu dibuat sebagai Editor"}
            </span>
          </p>
        </div>
        <FormField
          id="password"
          label={
            initial
              ? "Kata sandi baru (kosongkan bila tidak diubah)"
              : "Kata sandi"
          }
          type="password"
          value={password}
          onChange={setPassword}
          optionalHint={!!initial}
          placeholder="minimal 6 karakter"
          autoComplete="new-password"
        />
      </section>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : initial ? "Simpan Perubahan" : "Buat Akun"}
        </button>
      </div>
    </div>
  );
}
