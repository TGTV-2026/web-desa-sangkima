"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import DynamicLetterFields from "@/components/esurat/DynamicLetterFields";
import type { LetterFieldDef, LetterRequestData } from "@/server/types/letter";

export interface EditableFieldsProps {
  requestId: string;
  letterTypeCode: string;
  fields: LetterFieldDef[];
  initialData: LetterRequestData | null;
}

/** Field dinamis pemohon, langsung bisa dirapikan petugas (opsional) selama surat belum diproses. */
export default function EditableFields({
  requestId,
  letterTypeCode,
  fields,
  initialData,
}: EditableFieldsProps) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, String(initialData?.[f.name] ?? "")])),
  );

  if (fields.length === 0) return null;

  const save = () =>
    submit(
      () =>
        fetch(`/esurat/api/letter-requests/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "updateData", data: values }),
        }),
      {
        successMessage: "Data pemohon diperbarui.",
        errorFallback: "Gagal menyimpan perubahan",
        onSuccess: () => router.refresh(),
      },
    ).catch(() => {});

  return (
    <div className="py-2.5">
      <DynamicLetterFields
        letterTypeCode={letterTypeCode}
        fields={fields}
        values={values}
        onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
      />
      <button onClick={save} disabled={busy} className="btn-primary w-full mt-4">
        {busy ? "Menyimpan..." : "Simpan Perubahan Data"}
      </button>
    </div>
  );
}
