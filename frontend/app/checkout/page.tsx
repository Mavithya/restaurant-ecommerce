"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";

import {
  useCart,
} from "@/components/cart/CartContext";

import {
  createOrder,
} from "@/lib/api";


type PaymentMethod =
  | "PAYHERE"
  | "WHATSAPP";


const DELIVERY_FEE = 300;


export default function CheckoutPage() {
  const {
    items,
    subtotal,
    clearCart,
  } = useCart();


  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [method, setMethod] =
    useState<PaymentMethod>("PAYHERE");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const deliveryFee =
    items.length > 0
      ? DELIVERY_FEE
      : 0;

  const total =
    subtotal + deliveryFee;


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");


    if (items.length === 0) {
      setError(
        "Your cart is empty."
      );
      return;
    }


    setLoading(true);


    try {
      const order =
        await createOrder({
          customer_name: name.trim(),
          phone: phone.trim(),
          delivery_address:
            address.trim(),
          payment_method: method,

          items: items.map(
            (item) => ({
              product_id:
                item.product.id,
              quantity:
                item.quantity,
            })
          ),
        });


      clearCart();


      window.location.href =
        `/order-success?orderId=${order.id}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create order."
      );
    } finally {
      setLoading(false);
    }
  }


  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />

        <main className="mx-auto max-w-7xl px-5 py-20 lg:px-8">

          <h1 className="font-serif text-5xl tracking-tight">
            Your cart is empty.
          </h1>

          <Link
            href="/menu"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            Back to menu
          </Link>

        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">

        <Link
          href="/cart"
          className="mb-10 inline-flex items-center gap-2 text-sm text-[var(--muted)]"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>


        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">

          {/* Form */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Almost there
            </p>

            <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">
              Checkout
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Tell us where to bring your
              order and how you'd like to
              place it.
            </p>


            {error && (
              <div className="mt-8 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="mt-10 max-w-xl"
            >

              <div className="space-y-7">

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                  >
                    Your name
                  </label>

                  <input
                    id="name"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    className="h-12 w-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm outline-none focus:border-[var(--foreground)]"
                    placeholder="Mavithya"
                  />
                </div>


                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                  >
                    Phone
                  </label>

                  <input
                    id="phone"
                    required
                    minLength={7}
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    className="h-12 w-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm outline-none focus:border-[var(--foreground)]"
                    placeholder="0712345678"
                  />
                </div>


                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
                  >
                    Delivery address
                  </label>

                  <textarea
                    id="address"
                    required
                    minLength={5}
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    rows={4}
                    className="w-full resize-none border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--foreground)]"
                    placeholder="House number, street, area, city"
                  />
                </div>


                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]">
                    How would you like to order?
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={() =>
                        setMethod("PAYHERE")
                      }
                      className={`border p-5 text-left transition-colors ${
                        method === "PAYHERE"
                          ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                          : "border-[var(--line)] bg-[var(--surface)]"
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        PayHere
                      </div>

                      <div
                        className={`mt-2 text-xs leading-5 ${
                          method === "PAYHERE"
                            ? "text-white/70"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        Pay online using
                        PayHere Sandbox.
                      </div>
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        setMethod("WHATSAPP")
                      }
                      className={`border p-5 text-left transition-colors ${
                        method === "WHATSAPP"
                          ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                          : "border-[var(--line)] bg-[var(--surface)]"
                      }`}
                    >
                      <div className="text-sm font-semibold">
                        WhatsApp
                      </div>

                      <div
                        className={`mt-2 text-xs leading-5 ${
                          method === "WHATSAPP"
                            ? "text-white/70"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        Send your complete
                        order directly to us.
                      </div>
                    </button>

                  </div>
                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-3 bg-[var(--foreground)] text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Creating order..."
                    : "Continue"}

                  {!loading && (
                    <ArrowRight size={16} />
                  )}
                </button>

              </div>

            </form>
          </section>


          {/* Summary */}
          <aside className="h-fit border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Order summary
            </p>


            <div className="mt-7 space-y-5">

              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between gap-5 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {item.product.name}
                    </div>

                    <div className="mt-1 text-xs text-[var(--muted)]">
                      {item.quantity} × Rs.{" "}
                      {Number(
                        item.product.price
                      ).toLocaleString(
                        "en-LK"
                      )}
                    </div>
                  </div>

                  <div className="whitespace-nowrap">
                    Rs.{" "}
                    {(
                      Number(
                        item.product.price
                      ) * item.quantity
                    ).toLocaleString(
                      "en-LK"
                    )}
                  </div>
                </div>
              ))}

            </div>


            <div className="my-7 border-t border-[var(--line)]" />


            <div className="space-y-4 text-sm">

              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
                  Subtotal
                </span>

                <span>
                  Rs.{" "}
                  {subtotal.toLocaleString(
                    "en-LK"
                  )}
                </span>
              </div>


              <div className="flex justify-between">
                <span className="text-[var(--muted)]">
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


            <div className="my-6 border-t border-[var(--line)]" />


            <div className="flex justify-between">
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

          </aside>

        </div>

      </main>
    </div>
  );
}