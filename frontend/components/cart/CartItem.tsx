"use client";

import {
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import type { CartItem as CartItemType } from "@/components/cart/CartContext";

import { useCart } from "@/components/cart/CartContext";


interface CartItemProps {
  item: CartItemType;
}


export default function CartItem({
  item,
}: CartItemProps) {
  const {
    updateQuantity,
    removeFromCart,
  } = useCart();

  const price =
    Number(item.product.price);

  const subtotal =
    price * item.quantity;


  return (
    <div className="grid gap-5 border-b border-[var(--line)] py-6 sm:grid-cols-[120px_1fr_auto] sm:items-center">

      {/* Image */}
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-[#e8e1d5]">
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-4xl">
            🍽️
          </span>
        )}
      </div>


      {/* Product */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold tracking-tight">
              {item.product.name}
            </h3>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Rs.{" "}
              {price.toLocaleString("en-LK")} each
            </p>
          </div>

          <button
            onClick={() =>
              removeFromCart(
                item.product.id
              )
            }
            className="text-[var(--muted)] transition-colors hover:text-red-600"
            aria-label={`Remove ${item.product.name}`}
          >
            <Trash2 size={17} />
          </button>
        </div>


        <div className="mt-5 flex items-center justify-between gap-4">

          <div className="flex h-10 items-center border border-[var(--line)]">

            <button
              onClick={() =>
                updateQuantity(
                  item.product.id,
                  item.quantity - 1
                )
              }
              disabled={
                item.quantity <= 1
              }
              className="flex h-full w-10 items-center justify-center disabled:opacity-30"
            >
              <Minus size={15} />
            </button>


            <span className="w-10 text-center text-sm font-semibold">
              {item.quantity}
            </span>


            <button
              onClick={() =>
                updateQuantity(
                  item.product.id,
                  item.quantity + 1
                )
              }
              disabled={
                item.quantity >=
                item.product.stock
              }
              className="flex h-full w-10 items-center justify-center disabled:opacity-30"
            >
              <Plus size={15} />
            </button>

          </div>


          <div className="text-sm font-semibold">
            Rs.{" "}
            {subtotal.toLocaleString(
              "en-LK"
            )}
          </div>

        </div>
      </div>

    </div>
  );
}