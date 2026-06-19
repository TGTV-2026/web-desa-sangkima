"use client";

import FormField, { type FormFieldType } from "@/components/esurat/FormField";
import type { LetterFieldDef } from "@/server/types/letter";

export interface DynamicLetterFieldsProps {
  letterTypeCode: string;
  fields: LetterFieldDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

const FIELD_TYPE_MAP: Record<LetterFieldDef["type"], FormFieldType> = {
  text: "text",
  number: "number",
  date: "date",
  textarea: "textarea",
};

/** Field tambahan dinamis sesuai skema `requiredFields` jenis surat yang dipilih. */
export default function DynamicLetterFields({
  letterTypeCode,
  fields,
  values,
  onChange,
}: DynamicLetterFieldsProps) {
  if (fields.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 border-t border-line pt-5 animate-fade-in">
      <p className="overline-doc !text-brass tracking-widest font-bold">
        Instrumen Data Tambahan — {letterTypeCode}
      </p>

      <div className="grid grid-cols-1 gap-4">
        {fields.map((f) => (
          <FormField
            key={f.name}
            id={f.name}
            label={f.label}
            type={FIELD_TYPE_MAP[f.type]}
            value={values[f.name] ?? ""}
            onChange={(val) => onChange(f.name, val)}
            placeholder={f.placeholder}
            required={f.required}
            optionalHint={!f.required}
            labelClassName="text-xs font-semibold"
            inputClassName={`mt-1.5 bg-white focus:border-pine-900 ${f.type === "textarea" ? "" : "h-10.5"}`}
          />
        ))}
      </div>
    </div>
  );
}
