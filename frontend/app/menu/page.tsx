"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/products/ProductCard";
import CategoryFilter from "@/components/products/CategoryFilter";

import {
  getCategories,
  getProducts,
} from "@/lib/api";

import type {
  Category,
  Product,
} from "@/types";


export default function MenuPage() {
  const [products, setProducts] = useState<
    Product[]
  >([]);

  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        setError(
          "Unable to load categories."
        );
      }
    }

    loadCategories();
  }, []);


  useEffect(() => {
    const timer = setTimeout(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data = await getProducts({
            search,
            category_id:
              selectedCategory ?? undefined,
            available_only: false,
          });

          setProducts(data);
        } catch {
          setError(
            "Unable to load menu. Make sure the backend is running."
          );
        } finally {
          setLoading(false);
        }
      },
      300
    );

    return () => clearTimeout(timer);
  }, [search, selectedCategory]);


  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">

        {/* Header */}
        <section className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              The KORA menu
            </p>

            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl">
              Food worth
              <br />
              coming back for.
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[var(--muted)]">
              Familiar favourites, made fresh.
              Browse today's selection and
              build your order in a few clicks.
            </p>
          </div>

          <div className="text-sm text-[var(--muted)]">
            {products.length} items
          </div>
        </section>


        {/* Search */}
        <section className="mb-6">
          <div className="relative max-w-2xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search dishes..."
              className="h-12 w-full border border-[var(--line)] bg-[var(--surface)] pl-11 pr-4 text-sm outline-none transition-colors focus:border-[var(--foreground)]"
            />
          </div>
        </section>


        {/* Filters */}
        <section className="mb-12 flex items-center gap-3">
          <SlidersHorizontal
            size={16}
            className="shrink-0 text-[var(--muted)]"
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={
              selectedCategory
            }
            onCategoryChange={
              setSelectedCategory
            }
          />
        </section>


        {/* Error */}
        {error && (
          <div className="mb-8 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* Loading */}
        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse border border-[var(--line)] bg-[var(--surface)]"
                >
                  <div className="aspect-[4/3] bg-[#e8e2d8]" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 bg-[#e8e2d8]" />
                    <div className="h-4 w-full bg-[#e8e2d8]" />
                    <div className="h-4 w-4/5 bg-[#e8e2d8]" />
                  </div>
                </div>
              )
            )}
          </div>
        )}


        {/* Products */}
        {!loading &&
          products.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}


        {/* Empty state */}
        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-20 text-center">
              <p className="font-serif text-3xl">
                Nothing found.
              </p>

              <p className="mt-3 text-sm text-[var(--muted)]">
                Try another dish or category.
              </p>
            </div>
          )}
      </main>
    </div>
  );
}