"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
} from "lucide-react";

import { useCart } from "@/components/cart/CartContext";
import { useAuth } from "@/components/auth/AuthContext";


export default function Navbar() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, loading, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-(--line) bg-(--background)/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

        <Link
          href={isAdmin ? "/admin" : "/"}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--foreground) text-sm font-bold text-(--background)">
            K
          </div>

          <div>
            <div className="text-lg font-semibold tracking-tight">
              KORA
            </div>

            <div className="text-[10px] uppercase tracking-[0.22em] text-(--muted)">
              Kitchen
            </div>
          </div>
        </Link>


        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href={isAdmin ? "/admin" : "/"}
            className="transition-opacity hover:opacity-60"
          >
            Home
          </Link>

          <Link
            href={isAdmin ? "/admin" : "/menu"}
            className="transition-opacity hover:opacity-60"
          >
            Menu
          </Link>

          <a
            href={isAdmin ? "/admin" : "/#story"}
            className="transition-opacity hover:opacity-60"
          >
            Our Story
          </a>
        </nav>


        <div className="flex items-center gap-2">

          <Link
            href="/menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-(--line) transition-colors hover:bg-(--surface)"
            aria-label="Search menu"
          >
            <Search
              size={17}
              strokeWidth={1.8}
            />
          </Link>


          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-(--line) transition-colors hover:bg-(--surface)"
            aria-label="Shopping cart"
          >
            <ShoppingBag
              size={17}
              strokeWidth={1.8}
            />

            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--accent) px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

        </div>

        {!loading && (
          <>
            {user ? (
              <div className="flex items-center gap-2">

                <span className="hidden text-sm md:block text-(--muted)">
                  {user.name}
                </span>

                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="hidden text-xs font-semibold uppercase tracking-[0.12em] md:block text-(--foreground) hover:text-(--accent) transition-colors"
                  >
                    ADMIN
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-10 items-center rounded-full border border-(--line) px-4 text-xs font-semibold transition-colors hover:bg-(--surface) hover:border-(--foreground)"
                >
                  Logout
                </button>

              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-10 items-center rounded-full border border-(--line) px-4 text-xs font-semibold transition-colors hover:bg-(--surface) hover:border-(--foreground)"
              >
                Sign in
              </Link>
            )}
          </>
        )}
      </div>
      
    </header>
  );
}