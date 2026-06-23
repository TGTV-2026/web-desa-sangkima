"use client";

import { useState } from "react";
import FormField, { type FormFieldType } from "@/components/esurat/FormField";
import type { LetterFieldDef } from "@/server/types/letter";

const OTHER_OPTION = "Lainnya";

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
  time: "time",
  textarea: "textarea",
  select: "select",
};

const inputClass = (f: LetterFieldDef) =>
  `mt-1.5 bg-white focus:border-pine-900 ${f.type === "textarea" ? "" : "h-10.5"}`;

/** Select dengan opsi "Lainnya": saat dipilih, munculkan input teks untuk diketik manual. */
function SelectWithOther({
  field,
  value,
  onChange,
}: {
  field: LetterFieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  const options = field.options ?? [];
  // mode "Lainnya" aktif jika nilai tersimpan bukan salah satu opsi baku (mis. saat edit)
  const [otherMode, setOtherMode] = useState(
    value !== "" && !options.includes(value),
  );

  const handleSelect = (v: string) => {
    if (v === OTHER_OPTION) {
      setOtherMode(true);
      onChange(""); // kosongkan dulu, tunggu input manual
    } else {
      setOtherMode(false);
      onChange(v);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <FormField
        id={field.name}
        label={field.label}
        type="select"
        value={otherMode ? OTHER_OPTION : value}
        onChange={handleSelect}
        placeholder={field.placeholder ?? "— Pilih —"}
        options={options.map((o) => ({ value: o, label: o }))}
        required={field.required}
        optionalHint={!field.required}
        labelClassName="text-xs font-semibold"
        inputClassName={inputClass(field)}
      />
      {otherMode && (
        <FormField
          id={`${field.name}_lainnya`}
          label={`Sebutkan ${field.label} lainnya`}
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Ketik manual di sini"
          required={field.required}
          labelClassName="text-xs font-semibold"
          inputClassName={`${inputClass(field)} animate-fade-in`}
        />
      )}
    </div>
  );
}

/** Field tambahan dinamis sesuai skema `requiredFields` jenis surat yang dipilih. */
export default function DynamicLetterFields({
  letterTypeCode,
  fields,
  values,
  onChange,
}: DynamicLetterFieldsProps) {
  if (fields.length === 0) return null;

  return (
    <div className="@container flex flex-col gap-4 border-t border-line pt-5 animate-fade-in">
      <p className="overline-doc !text-brass tracking-widest font-bold">
        Instrumen Data Tambahan — {letterTypeCode}
      </p>

      {/* 2 kolom saat kontainer cukup lebar (form); tetap 1 kolom di sidebar detail yang sempit */}
      <div className="grid gap-4 @xl:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.type === "textarea" ? "@xl:col-span-2" : ""}>
            {f.type === "select" && (f.options ?? []).includes(OTHER_OPTION) ? (
              <SelectWithOther
                field={f}
                value={values[f.name] ?? ""}
                onChange={(val) => onChange(f.name, val)}
              />
            ) : (
              <FormField
                id={f.name}
                label={f.label}
                type={FIELD_TYPE_MAP[f.type]}
                value={values[f.name] ?? ""}
                onChange={(val) => onChange(f.name, val)}
                placeholder={
                  f.type === "select" ? (f.placeholder ?? "— Pilih —") : f.placeholder
                }
                options={f.options?.map((o) => ({ value: o, label: o }))}
                required={f.required}
                optionalHint={!f.required}
                labelClassName="text-xs font-semibold"
                inputClassName={inputClass(f)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
