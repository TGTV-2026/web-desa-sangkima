"use client";

export type FormFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "textarea"
  | "select";

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldProps {
  id: string;
  label: string;
  type?: FormFieldType;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  optionalHint?: boolean;
  options?: FormFieldOption[];
  rows?: number;
  autoComplete?: string;
  maxLength?: number;
  labelAction?: React.ReactNode;
  labelClassName?: string;
  inputClassName?: string;
}

export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required,
  optionalHint,
  options,
  rows = 3,
  autoComplete,
  maxLength,
  labelAction,
  labelClassName = "",
  inputClassName = "",
}: FormFieldProps) {
  const sharedClassName = `input-doc ${error ? "!border-oxide focus:!border-oxide focus:!ring-oxide/15" : ""} ${inputClassName}`;

  return (
    <div>
      {labelAction ? (
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor={id} className={`label-doc !mb-0 ${labelClassName}`}>
            {label}
            {optionalHint && (
              <span className="normal-case tracking-normal font-normal text-inkmut/60 italic ml-1">
                (opsional)
              </span>
            )}
          </label>
          {labelAction}
        </div>
      ) : (
        <label htmlFor={id} className={`label-doc ${labelClassName}`}>
          {label}
          {optionalHint && (
            <span className="normal-case tracking-normal font-normal text-inkmut/60 italic ml-1">
              (opsional)
            </span>
          )}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={sharedClassName}
        />
      ) : type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          className={sharedClassName}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={sharedClassName}
        />
      )}

      {error && <p className="text-xs text-oxide mt-1.5">{error}</p>}
    </div>
  );
}
