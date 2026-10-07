"use client";

import Link from "next/link";
import {
  Check,
  ArrowRight,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";


export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto flex max-w-3xl px-5 py-20 lg:px-8 lg:py-28">

        <div className="w-full border border-(--line) bg-(--surface) p-8 text-center sm:p-14">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--foreground) text-white">
            <Check size={28} />
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
            Order received
          </p>

          <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">
            Thank you.
          </h1>

          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-(--muted)">
            Your order has been received.
            We'll take it from here.
          </p>

          <Link
            href="/menu"
            className="mt-9 inline-flex items-center gap-3 bg-(--foreground) px-6 py-3 text-sm font-semibold text-white"
          >
            Back to menu
            <ArrowRight size={16} />
          </Link>

        </div>
      </main>
    </div>
  );
}