"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import FormField from "@/components/esurat/FormField";
import type { PositionDTO } from "@/server/types/position";

// ponytail: duplikat dari positionCategories di db/schema/positions.ts —
// hindari import schema drizzle ke client bundle, sinkronkan manual jika berubah
const CATEGORIES = [
  "Staff",
  "Kepala Urusan",
  "Kepala Seksi",
  "Sekretaris Desa",
  "Wakil Kepala Desa",
  "Kepala Desa",
];

type Props =
  | { mode: "create" }
  | { mode: "edit"; position: PositionDTO };

export default function PositionForm(props: Props) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const initial = props.mode === "edit" ? props.position : undefined;

  const [category, setCategory] = useState(initial?.category ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const isEdit = props.mode === "edit";
    await submit(
      () =>
        fetch(isEdit ? `/esurat/api/position/${props.position.id}` : "/esurat/api/position", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, name }),
        }),
      {
        successMessage: isEdit ? "Jabatan berhasil diperbarui." : "Jabatan baru berhasil dibuat.",
        successTitle: "Tersimpan",
        errorFallback: isEdit ? "Gagal memperbarui jabatan" : "Gagal membuat jabatan",
        extractErrorMessage: (json) =>
          json.errors && (Object.values(json.errors).flat()[0] as string | undefined),
        onSuccess: () => {
          if (isEdit) {
            router.refresh();
          } else {
            router.push("/esurat/dashboard/posisi");
            router.refresh();
          }
        },
      },
    ).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("Nama")) setErrors((er) => ({ ...er, name: message }));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 sm:p-7 flex flex-col gap-5">
      <FormField
        id="category" label="Kategori" type="select" value={category}
        onChange={setCategory} error={errors.category} required
        placeholder="— Pilih kategori —"
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      />
      <FormField
        id="name" label="Nama Jabatan" value={name}
        onChange={setName} error={errors.name} required
        placeholder="mis. Kepala Desa"
      />

      <div className="pt-2">
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
          {busy ? "Menyimpan..." : props.mode === "edit" ? "Simpan Perubahan" : "Buat Jabatan"}
        </button>
      </div>
    </form>
  );
}
