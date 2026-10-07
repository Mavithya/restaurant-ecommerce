"use client";

import Link from "next/link";
import { ShoppingBag, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-bold text-[var(--background)]">
            K
          </div>

          <div>
            <div className="text-lg font-semibold tracking-tight">
              KORA
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
              Kitchen
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/"
            className="transition-opacity hover:opacity-60"
          >
            Home
          </Link>

          <Link
            href="/menu"
            className="transition-opacity hover:opacity-60"
          >
            Menu
          </Link>

          <a
            href="#story"
            className="transition-opacity hover:opacity-60"
          >
            Our Story
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] transition-colors hover:bg-[var(--surface)]"
            aria-label="Search menu"
          >
            <Search size={17} strokeWidth={1.8} />
          </Link>

          <Link
            href="/cart"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] transition-colors hover:bg-[var(--surface)]"
            aria-label="Shopping cart"
          >
            <ShoppingBag size={17} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </header>
  );
}