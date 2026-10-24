import { CONDITIONS, STATUSES, label } from "@/lib/constants";

const STATUS_STYLES: Record<string, string> = {
  DISPONIBLE: "bg-emerald-100 text-emerald-800",
  RESERVADO: "bg-amber-100 text-amber-800",
  VENDIDO: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] ?? ""}`}>
      {label(STATUSES, status)}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: string }) {
  const isNew = condition === "NUEVO";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        isNew ? "bg-brand-600 text-white" : "bg-ink-900 text-white"
      }`}
    >
      {label(CONDITIONS, condition)}
    </span>
  );
}
