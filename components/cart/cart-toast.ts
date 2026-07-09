"use client";

export type CartToastVariant = "success" | "error" | "info";

export type CartToastDetail = {
  message: string;
  title?: string;
  variant?: CartToastVariant;
  duration?: number;
};

export const CART_TOAST_EVENT = "flexipass:toast";

export const emitCartToast = (detail: CartToastDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CartToastDetail>(CART_TOAST_EVENT, { detail }));
};
