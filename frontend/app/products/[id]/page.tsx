"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Minus } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { getProduct } from "@/lib/api";
import type { Product } from "@/types";


export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] =
    useState<Product | null>(null);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadProduct() {
      try {
        const { id } = await params;

        const data = await getProduct(
          Number(id)
        );

        setProduct(data);
      } catch {
        setError(
          "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params]);


  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />

        <main className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="h-10 w-40 animate-pulse bg-[#e8e2d8]" />
        </main>
      </div>
    );
  }


  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Navbar />

        <main className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8">
          <p className="font-serif text-4xl">
            Product not found
          </p>

          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
          >
            <ArrowLeft size={16} />
            Back to menu
          </Link>
        </main>
      </div>
    );
  }


  const unavailable =
    !product.is_available ||
    product.stock <= 0;


  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">

        <Link
          href="/menu"
          className="mb-12 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <ArrowLeft size={16} />
          Back to menu
        </Link>


        <div className="grid overflow-hidden border border-[var(--line)] bg-[var(--surface)] lg:grid-cols-2">

          {/* Image */}
          <div className="flex aspect-square items-center justify-center bg-[#e6dfd2] lg:aspect-auto">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-8xl">
                🍽️
              </span>
            )}
          </div>


          {/* Details */}
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-16">

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Freshly prepared
            </p>

            <h1 className="font-serif text-5xl leading-none tracking-tight sm:text-6xl">
              {product.name}
            </h1>

            <div className="mt-6 text-xl font-medium">
              Rs.{" "}
              {Number(
                product.price
              ).toLocaleString("en-LK")}
            </div>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[var(--muted)]">
              {product.description ||
                "Prepared fresh in our kitchen with carefully selected ingredients."}
            </p>


            <div className="mt-10 border-t border-[var(--line)] pt-8">

              <div className="mb-5 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Quantity
              </div>

              <div className="flex items-center gap-4">

                <div className="flex h-12 items-center border border-[var(--line)]">
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          quantity - 1
                        )
                      )
                    }
                    className="flex h-full w-12 items-center justify-center hover:bg-[#f0ece3]"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-10 text-center text-sm font-semibold">
                    {quantity}
                  </span>

                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          product.stock,
                          quantity + 1
                        )
                      )
                    }
                    className="flex h-full w-12 items-center justify-center hover:bg-[#f0ece3]"
                  >
                    <Plus size={16} />
                  </button>
                </div>


                <span className="text-xs text-[var(--muted)]">
                  {product.stock} available
                </span>

              </div>


              <button
                disabled={unavailable}
                className="mt-6 h-12 w-full bg-[var(--foreground)] text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {unavailable
                  ? "Currently unavailable"
                  : "Add to cart"}
              </button>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}