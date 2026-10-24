import { LEAD_STATUSES, LEAD_TYPES, label } from "@/lib/constants";

const LEAD_STATUS_STYLES: Record<string, string> = {
  NUEVO: "bg-brand-100 text-brand-700",
  CONTACTADO: "bg-sky-100 text-sky-800",
  CERRADO: "bg-emerald-100 text-emerald-800",
  DESCARTADO: "bg-slate-200 text-slate-600",
};

export function LeadStatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${LEAD_STATUS_STYLES[status] ?? ""}`}>
      {label(LEAD_STATUSES, status)}
    </span>
  );
}

export function LeadTypeBadge({ type }: { type: string }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${type === "TEST_DRIVE" ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-700"}`}>
      {label(LEAD_TYPES, type)}
    </span>
  );
}
