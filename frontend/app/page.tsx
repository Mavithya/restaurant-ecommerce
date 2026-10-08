import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  Sparkles,
  Flame,
  ChefHat,
  CheckCircle2,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";

const HERO_IMAGE_URL =
  "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791466417/kora/hero/hero_table_spread.jpg";

const STORY_IMAGE_URL =
  "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791467004/kora/story/story_kitchen_cooking.jpg";

const dishes = [
  {
    name: "Chicken Fried Rice",
    price: "Rs. 1,650",
    note: "Wok-tossed · hearty · fresh",
    image_url:
      "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465484/kora/products/seed_chicken_fried_rice.jpg",
  },
  {
    name: "Cheese Chicken Kottu",
    price: "Rs. 1,850",
    note: "Wok-fried · cheesy · spicy",
    image_url:
      "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465488/kora/products/seed_cheese_chicken_kottu.jpg",
  },
  {
    name: "Butter Chicken Masala",
    price: "Rs. 1,750",
    note: "Creamy · rich · aromatic",
    image_url:
      "https://res.cloudinary.com/ju3rkjsd/image/upload/v1791465489/kora/products/seed_butter_chicken.jpg",
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

            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-(--accent)">
              Kitchen · Crafted Daily
            </p>

            <h1 className="max-w-3xl font-serif text-6xl leading-[0.88] tracking-tight sm:text-7xl lg:text-[7rem]">
              Good food
              <br />
              needs no
              <br />
              explanation.
            </h1>

            <p className="mt-8 max-w-md text-sm leading-7 text-(--muted) sm:text-base">
              Honest ingredients, familiar flavours
              and a kitchen that takes its time where
              it matters.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center gap-3 bg-(--foreground) px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Browse the menu
                <ArrowUpRight size={16} />
              </Link>

              <a
                href="#story"
                className="inline-flex items-center border border-(--line) bg-(--surface) px-6 py-3 text-sm font-semibold"
              >
                Our story
              </a>
            </div>

          </div>


          {/* Visual block */}
          <div className="mt-12 lg:mt-0 lg:pl-12">

            <div className="relative aspect-4/5 overflow-hidden border border-(--line) bg-[#ddd3c2]">

              <img
                src={HERO_IMAGE_URL}
                alt="KORA Table Spread"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white sm:p-8">

                <div className="flex justify-between text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                  <span>KORA / 01</span>
                  <span>Daily table</span>
                </div>

                <div>
                  <p className="max-w-xs font-serif text-4xl leading-tight text-white sm:text-5xl">
                    Made for the table,
                    not the feed.
                  </p>
                </div>

              </div>

              <div className="absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-xs font-bold uppercase tracking-widest text-(--foreground) shadow-lg">
                Eat
              </div>

            </div>

          </div>
        </section>


        {/* Small information row */}
        <section className="border-y border-(--line)">
          <div className="mx-auto grid max-w-7xl divide-y divide-(--line) px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">

            <div className="flex items-center gap-4 px-0 py-5 sm:px-6">
              <Clock3 size={18} />
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.13em]">
                  Open daily
                </div>
                <div className="mt-1 text-xs text-(--muted)">
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
                <div className="mt-1 text-xs text-(--muted)">
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
                <div className="mt-1 text-xs text-(--muted)">
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
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-(--accent)">
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
            {dishes.map((dish) => (
              <Link
                href="/menu"
                key={dish.name}
                className="group border border-(--line) bg-(--surface)"
              >
                <div className="relative aspect-5/4 overflow-hidden bg-[#e9e2d6]">
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />

                  <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex justify-between gap-4">
                    <h3 className="font-semibold tracking-tight">
                      {dish.name}
                    </h3>

                    <span className="whitespace-nowrap text-sm font-medium">
                      {dish.price}
                    </span>
                  </div>

                  <p className="text-xs uppercase tracking-widest text-(--muted)">
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
          className="border-t border-(--line) bg-(--surface)"
        >
          <div className="mx-auto grid max-w-7xl px-5 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8 lg:py-24 items-center">

            {/* Left Image Showcase */}
            <div className="relative">
              <div className="relative aspect-4/3 overflow-hidden border border-(--line) bg-[#ddd3c2] sm:aspect-square">
                <img
                  src={STORY_IMAGE_URL}
                  alt="KORA Chef preparing dish"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                    Est. 2026 · Colombo
                  </p>
                  <p className="mt-1 font-serif text-2xl">
                    Crafted with pride & precision
                  </p>
                </div>
              </div>

              {/* Quality Badge */}
              <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-3 border border-(--line) bg-(--background) p-4 shadow-xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--accent) text-white">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">100% Fresh</div>
                  <div className="text-[11px] text-(--muted)">Cooked to order</div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="mt-12 flex flex-col justify-center lg:mt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--accent)">
                Our Story
              </p>

              <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
                A small kitchen with a big respect for good ingredients.
              </h2>

              <p className="mt-6 text-sm leading-8 text-(--muted) sm:text-base">
                KORA is built around a simple idea: make food you'd happily order twice.
                We keep the menu focused, prepare everything fresh daily, and let honest
                flavours do the talking.
              </p>

              {/* Value Pillars */}
              <div className="mt-10 grid gap-4 sm:grid-cols-3 border-t border-(--line) pt-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 size={15} className="text-(--accent)" />
                    Fresh Daily
                  </div>
                  <p className="text-xs text-(--muted) leading-5">
                    Sourced locally every morning.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                    <Flame size={15} className="text-(--accent)" />
                    Authentic
                  </div>
                  <p className="text-xs text-(--muted) leading-5">
                    Traditional recipes & spices.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                    <ChefHat size={15} className="text-(--accent)" />
                    Zero Shortcuts
                  </div>
                  <p className="text-xs text-(--muted) leading-5">
                    No artificial preservatives.
                  </p>
                </div>
              </div>

              <div className="mt-9">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-3 bg-(--foreground) px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Explore Our Menu
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>

          </div>
        </section>


        {/* Footer */}
        <footer className="border-t border-(--line)">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-8 text-xs text-(--muted) sm:flex-row lg:px-8">

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