"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubmitAction } from "@/hooks/useSubmitAction";
import FormField from "@/components/esurat/FormField";
import DynamicLetterFields from "@/components/esurat/DynamicLetterFields";
import type { LetterFieldDef, LetterRequestData } from "@/server/types/letter";

export interface EditableFieldsProps {
  requestId: string;
  letterTypeCode: string;
  fields: LetterFieldDef[];
  initialData: LetterRequestData | null;
  initialPurpose: string;
}

/** Keperluan & field dinamis pemohon, langsung bisa dirapikan petugas (opsional) selama surat belum diproses. */
export default function EditableFields({
  requestId,
  letterTypeCode,
  fields,
  initialData,
  initialPurpose,
}: EditableFieldsProps) {
  const router = useRouter();
  const { busy, submit } = useSubmitAction();
  const [purpose, setPurpose] = useState(initialPurpose);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, String(initialData?.[f.name] ?? "")])),
  );

  const save = () =>
    submit(
      () =>
        fetch(`/esurat/api/letter-requests/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "updateData", purpose, data: values }),
        }),
      {
        successMessage: "Data pemohon diperbarui.",
        errorFallback: "Gagal menyimpan perubahan",
        onSuccess: () => router.refresh(),
      },
    ).catch(() => {});

  return (
    <div className="py-2.5 flex flex-col gap-4">
      <FormField
        id="purpose"
        label="Keperluan"
        type="textarea"
        value={purpose}
        onChange={setPurpose}
        required
        rows={3}
      />
      <DynamicLetterFields
        letterTypeCode={letterTypeCode}
        fields={fields}
        values={values}
        onChange={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
      />
      <button onClick={save} disabled={busy} className="btn-primary w-full">
        {busy ? "Menyimpan..." : "Simpan Perubahan Data"}
      </button>
    </div>
  );
}
