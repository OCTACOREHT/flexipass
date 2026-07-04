"use client";

import { emitCartToast } from "@/components/cart/cart-toast";

type CartItemInput = {
  id?: string;
  title: string;
  price: number | string;
  image?: string;
};

type Props = {
  item: CartItemInput;
  className?: string;
  iconClass?: string;
  title?: string;
};

const CART_KEY = "flexipass_cart";

const normalizeId = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/%20/g, "-");

const getNumericPrice = (value: number | string) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const addItemToCart = (item: CartItemInput) => {
  try {
    const id = item.id || normalizeId(item.title);
    const price = getNumericPrice(item.price);
    const raw = window.localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(items) ? items : [];
    const index = list.findIndex((entry) => entry.id === id && entry.price === price);

    if (index >= 0) {
      list[index] = { ...list[index], qty: (Number(list[index].qty) || 1) + 1 };
    } else {
      list.push({
        id,
        title: item.title,
        price,
        qty: 1,
        image: item.image,
      });
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("cart:updated"));
    emitCartToast({ message: "Produit ajouté au panier.", variant: "success", duration: 1500 });
  } catch (error) {
    console.warn("Impossible d'ajouter l'article au panier.", error);
  }
};

export default function AddToCartButton({
  item,
  className = "btn-icon primary",
  iconClass = "ri-shopping-cart-2-line",
  title = "Ajouter au panier",
}: Props) {
  return (
    <button type="button" className={className} title={title} onClick={() => addItemToCart(item)}>
      <i className={iconClass} />
    </button>
  );
}
