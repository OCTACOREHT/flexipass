"use client";

import type { Toast } from "@/components/admin/hooks/useToasts";

type ToasterProps = {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  className?: string;
  toastClassName?: string;
};

const variantStyles: Record<string, string> = {
  success:
    "border-[#ff6a1a] text-white bg-[#ff6a1a] shadow-[0_18px_40px_-24px_rgba(255,106,26,0.65)]",
  error: "border-rose-200/70 text-rose-900 bg-rose-50/90 shadow-rose-500/20",
  info: "border-indigo-200/80 text-slate-900 bg-white/90 shadow-indigo-500/20",
};

export default function Toaster({ toasts, onDismiss, className, toastClassName }: ToasterProps) {
  if (!toasts.length) return null;

  return (
    <div
      className={className || "fixed right-6 top-6 z-[60] flex w-[min(360px,92vw)] flex-col gap-3"}
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const variant = toast.variant ?? "info";
        return (
          <div
            key={toast.id}
            role={variant === "error" ? "alert" : "status"}
            className={`${toastClassName || "animate-[admin-toast-in_180ms_ease-out]"} rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur motion-reduce:animate-none ${variantStyles[variant]}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {toast.title && <p className="text-xs font-semibold uppercase tracking-[0.2em]">{toast.title}</p>}
                <p className="mt-1 text-sm font-medium">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="rounded-md border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-black transition hover:bg-white/90"
                aria-label="Fermer la notification"
              >
                Fermer
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
