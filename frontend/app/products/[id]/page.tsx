"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/components/cart/CartContext";
import { getProduct } from "@/lib/api";
import type { Product } from "@/types";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);

  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (isNaN(productId)) {
        setError("Invalid product ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getProduct(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product || !product.is_available || product.stock <= 0) return;

    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const isUnavailable =
    !product || !product.is_available || product.stock <= 0;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-16">
        {/* Back navigation */}
        <Link
          href="/menu"
          className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--muted) transition-colors hover:text-(--foreground)"
        >
          <ArrowLeft size={16} />
          Back to menu
        </Link>

        {/* Loading state */}
        {loading && (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-4/3 animate-pulse border border-(--line) bg-(--surface)" />
            <div className="space-y-4">
              <div className="h-6 w-1/4 animate-pulse bg-[#e8e2d8]" />
              <div className="h-10 w-3/4 animate-pulse bg-[#e8e2d8]" />
              <div className="h-6 w-1/3 animate-pulse bg-[#e8e2d8]" />
              <div className="h-24 w-full animate-pulse bg-[#e8e2d8]" />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-serif text-2xl text-red-800">
              Product Not Found
            </p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 bg-(--foreground) px-6 py-3 text-sm font-semibold text-white"
            >
              Return to menu
            </Link>
          </div>
        )}

        {/* Product view */}
        {!loading && !error && product && (
          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            {/* Image section */}
            <div className="relative aspect-4/3 overflow-hidden border border-(--line) bg-(--surface)">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#e6dfd2] text-7xl">
                  🍽️
                </div>
              )}

              {isUnavailable && (
                <div className="absolute left-5 top-5 bg-(--foreground) px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  Sold out
                </div>
              )}
            </div>

            {/* Content section */}
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
                  KORA Specialty
                </p>

                <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                  {product.name}
                </h1>

                <div className="mt-4 text-2xl font-medium">
                  Rs. {Number(product.price).toLocaleString("en-LK")}
                </div>

                <p className="mt-6 text-sm leading-7 text-(--muted)">
                  {product.description ||
                    "Freshly prepared with authentic ingredients and recipes crafted for the best experience."}
                </p>

                {/* Stock info */}
                <div className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      product.is_available && product.stock > 0
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />
                  {product.is_available && product.stock > 0
                    ? `In Stock (${product.stock} available)`
                    : "Currently Unavailable"}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-10 border-t border-(--line) pt-8">
                <div className="flex items-center gap-4">
                  {/* Quantity adjustment */}
                  <div className="flex h-12 items-center border border-(--line) bg-(--surface)">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isUnavailable}
                      className="flex h-12 w-12 items-center justify-center text-(--muted) transition-colors hover:text-(--foreground) disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      disabled={quantity >= product.stock || isUnavailable}
                      className="flex h-12 w-12 items-center justify-center text-(--muted) transition-colors hover:text-(--foreground) disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isUnavailable}
                    className="flex h-12 flex-1 items-center justify-center gap-3 bg-(--foreground) px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {added ? (
                      <>
                        <Check size={18} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Add to Cart • Rs.{" "}
                        {(Number(product.price) * quantity).toLocaleString(
                          "en-LK"
                        )}
                      </>
                    )}
                  </button>
                </div>

                {added && (
                  <div className="mt-4 flex items-center justify-between text-xs text-(--muted)">
                    <span>Item added to your cart.</span>
                    <Link
                      href="/cart"
                      className="font-semibold text-(--foreground) underline underline-offset-4"
                    >
                      View Cart & Checkout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}