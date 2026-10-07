import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";


const dishes = [
  {
    name: "Chicken Fried Rice",
    price: "Rs. 950",
    note: "Wok-tossed · hearty · fresh",
    symbol: "🍚",
  },
  {
    name: "Chicken Burger",
    price: "Rs. 1,100",
    note: "Crispy · creamy · satisfying",
    symbol: "🍔",
  },
  {
    name: "Chocolate Cake",
    price: "Rs. 650",
    note: "Rich · soft · baked today",
    symbol: "🍰",
  },
];


export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>

        {/* Hero */}
        <section className="mx-auto grid max-w-7xl px-5 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-16">

          <div className="flex flex-col justify-center">

            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              Kitchen · Crafted Daily
            </p>

            <h1 className="max-w-3xl font-serif text-6xl leading-[0.88] tracking-tight sm:text-7xl lg:text-[7rem]">
              Good food
              <br />
              needs no
              <br />
              explanation.
            </h1>

            <p className="mt-8 max-w-md text-sm leading-7 text-[var(--muted)] sm:text-base">
              Honest ingredients, familiar flavours
              and a kitchen that takes its time where
              it matters.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center gap-3 bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Browse the menu
                <ArrowUpRight size={16} />
              </Link>

              <a
                href="#story"
                className="inline-flex items-center border border-[var(--line)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold"
              >
                Our story
              </a>
            </div>

          </div>


          {/* Visual block */}
          <div className="mt-12 lg:mt-0 lg:pl-12">

            <div className="relative aspect-[4/5] overflow-hidden bg-[#ddd3c2]">

              <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">

                <div className="flex justify-between text-xs uppercase tracking-[0.18em]">
                  <span>KORA / 01</span>
                  <span>Daily table</span>
                </div>

                <div>
                  <div className="mb-5 text-7xl sm:text-8xl">
                    🍛
                  </div>

                  <p className="max-w-xs font-serif text-4xl leading-tight sm:text-5xl">
                    Made for the table,
                    not the feed.
                  </p>
                </div>

              </div>

              <div className="absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--foreground)] text-xs font-semibold uppercase tracking-widest text-white">
                Eat
              </div>

            </div>

          </div>
        </section>


        {/* Small information row */}
        <section className="border-y border-[var(--line)]">
          <div className="mx-auto grid max-w-7xl divide-y divide-[var(--line)] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">

            <div className="flex items-center gap-4 px-0 py-5 sm:px-6">
              <Clock3 size={18} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.13em]">
                  Open daily
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  10:30 AM — 10:00 PM
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-0 py-5 sm:px-6">
              <MapPin size={18} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.13em]">
                  Colombo
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  Delivery available
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 px-0 py-5 sm:px-6">
              <span className="text-lg">✦</span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.13em]">
                  Made fresh
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  No shortcuts
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* Featured */}
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">

          <div className="mb-10 flex items-end justify-between gap-6">

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                From the kitchen
              </p>

              <h2 className="font-serif text-4xl tracking-tight sm:text-5xl">
                The regulars.
              </h2>
            </div>

            <Link
              href="/menu"
              className="hidden items-center gap-2 text-sm font-semibold sm:flex"
            >
              See full menu
              <ArrowUpRight size={16} />
            </Link>

          </div>


          <div className="grid gap-5 md:grid-cols-3">
            {dishes.map((dish, index) => (
              <Link
                href="/menu"
                key={dish.name}
                className="group border border-[var(--line)] bg-[var(--surface)]"
              >
                <div className="flex aspect-[5/4] items-center justify-center bg-[#e9e2d6] text-8xl transition-transform duration-500 group-hover:scale-[1.01]">
                  {dish.symbol}
                </div>

                <div className="p-5">
                  <div className="mb-2 flex justify-between gap-4">
                    <h3 className="font-semibold">
                      {dish.name}
                    </h3>

                    <span className="text-sm">
                      {dish.price}
                    </span>
                  </div>

                  <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
                    {dish.note}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </section>


        {/* Story */}
        <section
          id="story"
          className="border-t border-[var(--line)]"
        >
          <div className="mx-auto grid max-w-7xl px-5 py-16 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-24">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Our story
            </p>

            <div className="mt-7 lg:mt-0">
              <h2 className="max-w-3xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                A small kitchen with a
                big respect for good
                ingredients.
              </h2>

              <p className="mt-7 max-w-2xl text-sm leading-8 text-[var(--muted)]">
                KORA is built around a simple idea:
                make food you'd happily order twice.
                We keep the menu focused, prepare
                things fresh and let the ingredients
                do most of the talking.
              </p>
            </div>

          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-[var(--line)]">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-8 text-xs text-[var(--muted)] sm:flex-row lg:px-8">

            <span>
              © 2026 KORA Kitchen
            </span>

            <span>
              Fresh food · Colombo
            </span>

          </div>
        </footer>

      </main>
    </div>
  );
}