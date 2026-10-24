import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function TextField({
  name,
  label,
  error,
  ...props
}: { name: string; label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input id={name} name={name} className="input" aria-invalid={!!error} {...props} />
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  error,
  ...props
}: { name: string; label: string; error?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <textarea id={name} name={name} rows={3} className="input" aria-invalid={!!error} {...props} />
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </div>
  );
}

export function SelectField({
  name,
  label,
  error,
  options,
  emptyLabel,
  ...props
}: {
  name: string;
  label: string;
  error?: string;
  options: Record<string, string> | [string, string][];
  emptyLabel?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const entries = Array.isArray(options) ? options : Object.entries(options);
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <select id={name} name={name} className="input" aria-invalid={!!error} {...props}>
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {entries.map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-brand-600">{error}</p>}
    </div>
  );
}

export function FormMessage({ message, isError }: { message?: string; isError?: boolean }) {
  if (!message) return null;
  return (
    <p role="status" className={`text-sm ${isError ? "text-brand-600" : "text-emerald-700"}`}>
      {message}
    </p>
  );
}
