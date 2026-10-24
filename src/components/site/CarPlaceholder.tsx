export function CarPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`grid place-items-center bg-slate-100 text-slate-300 ${className}`}>
      <svg viewBox="0 0 64 32" className="w-1/3" fill="currentColor" aria-hidden="true">
        <path d="M10 22a5 5 0 1 0 10 0 5 5 0 0 0-10 0Zm34 0a5 5 0 1 0 10 0 5 5 0 0 0-10 0ZM4 20c0-3 1-5 4-6l6-2 7-6c2-1 4-2 6-2h10c3 0 5 1 7 3l6 5 7 1c3 1 5 3 5 6v3h-6a7 7 0 0 0-14 0H22a7 7 0 0 0-14 0H4v-2Zm20-14-5 5h12V5h-5c-1 0-2 0-2 1Zm10-1v6h13l-5-4c-1-1-3-2-5-2h-3Z" />
      </svg>
      <span className="sr-only">Sin foto</span>
    </div>
  );
}
