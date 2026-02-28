"use client";

import { useEffect, useRef, useState } from "react";

export type ToastVariant = "success" | "error" | "info";

export type Toast = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

const DEFAULT_DURATION = 3000;

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  };

  const pushToast = (toast: Omit<Toast, "id">) => {
    const id = createId();
    const duration = toast.duration ?? DEFAULT_DURATION;
    setToasts((current) => [...current, { ...toast, id }]);
    const timer = window.setTimeout(() => dismissToast(id), duration);
    timersRef.current.set(id, timer);
    return id;
  };

  return { toasts, pushToast, dismissToast };
}
