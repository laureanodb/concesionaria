"use client";

import { useTransition } from "react";

/**
 * Botón que ejecuta una acción del servidor, con confirmación opcional.
 * Si la acción devuelve { error }, se muestra en un aviso.
 */
export function ActionButton({
  action,
  confirmText,
  className = "btn-outline",
  pendingText,
  children,
}: {
  action: () => Promise<{ error?: string } | void>;
  confirmText?: string;
  className?: string;
  pendingText?: string;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (confirmText && !confirm(confirmText)) return;
        startTransition(async () => {
          const result = await action();
          if (result?.error) alert(result.error);
        });
      }}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
