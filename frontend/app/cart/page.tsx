"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import CartItem from "@/components/cart/CartItem";
import { useCart } from "@/components/cart/CartContext";
import { useAuth } from "@/components/auth/AuthContext";


const DELIVERY_FEE = 300;


export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [user, authLoading, router]);

  const {
    items,
    itemCount,
    subtotal,
    clearCart,
  } = useCart();


  const deliveryFee =
    items.length > 0
      ? DELIVERY_FEE
      : 0;

  const total =
    subtotal + deliveryFee;


  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />

        <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
            Your order
          </p>

          <div className="mt-12 max-w-xl">

            <h1 className="font-serif text-5xl leading-none tracking-tight sm:text-6xl">
              Your cart
              <br />
              is waiting.
            </h1>

            <p className="mt-6 text-sm leading-7 text-(--muted)">
              Nothing here yet. Have a look
              around the menu and find something
              worth bringing home.
            </p>

            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-3 bg-(--foreground) px-6 py-3 text-sm font-semibold text-white"
            >
              Browse the menu
              <ArrowRight size={16} />
            </Link>

          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">

        <div className="flex flex-col justify-between gap-6 border-b border-(--line) pb-10 sm:flex-row sm:items-end">

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
              Your order
            </p>

            <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
              Shopping cart
            </h1>
          </div>

          <div className="flex items-center gap-5 text-sm text-(--muted)">
            <span>
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}
            </span>

            <button
              onClick={clearCart}
              className="text-xs font-semibold uppercase tracking-[0.12em] underline underline-offset-4"
            >
              Clear cart
            </button>
          </div>
        </div>


        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">

          {/* Items */}
          <section>
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
              />
            ))}

            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold"
            >
              <ArrowLeft size={16} />
              Continue shopping
            </Link>
          </section>


          {/* Summary */}
          <aside className="h-fit border border-(--line) bg-(--surface) p-6 sm:p-7">

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--muted)">
              Order summary
            </p>

            <div className="mt-7 space-y-4 text-sm">

              <div className="flex justify-between gap-4">
                <span className="text-(--muted)">
                  Subtotal
                </span>

                <span>
                  Rs.{" "}
                  {subtotal.toLocaleString(
                    "en-LK"
                  )}
                </span>
              </div>


              <div className="flex justify-between gap-4">
                <span className="text-(--muted)">
                  Delivery
                </span>

                <span>
                  Rs.{" "}
                  {deliveryFee.toLocaleString(
                    "en-LK"
                  )}
                </span>
              </div>

            </div>


            <div className="my-6 border-t border-(--line)" />


            <div className="flex justify-between gap-4">
              <span className="font-semibold">
                Total
              </span>

              <span className="text-lg font-semibold">
                Rs.{" "}
                {total.toLocaleString(
                  "en-LK"
                )}
              </span>
            </div>


            <Link
              href="/checkout"
              className="mt-7 flex h-12 items-center justify-center gap-2 bg-(--foreground) text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Proceed to checkout
              <ArrowRight size={16} />
            </Link>

            <p className="mt-4 text-center text-[11px] leading-5 text-(--muted)">
              Delivery fee is currently
              Rs. 300 per order.
            </p>

          </aside>

        </div>

      </main>
    </div>
  );
}