"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -240 : 240;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative flex-1 min-w-0">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll("left")}
          aria-label="Scroll categories left"
          className="absolute -left-3 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-(--line) bg-(--surface) shadow-md text-(--foreground) hover:bg-(--foreground) hover:text-white transition-all duration-200"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          onClick={() => handleScroll("right")}
          aria-label="Scroll categories right"
          className="absolute -right-3 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-(--line) bg-(--surface) shadow-md text-(--foreground) hover:bg-(--foreground) hover:text-white transition-all duration-200"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Categories Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1 scroll-smooth"
      >
        <button
          onClick={() => onCategoryChange(null)}
          className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
            selectedCategory === null
              ? "bg-(--foreground) text-white shadow-sm"
              : "border border-(--line) bg-(--surface) text-(--muted) hover:border-(--foreground) hover:text-(--foreground)"
          }`}
        >
          <Sparkles size={13} className={selectedCategory === null ? "text-(--accent)" : "opacity-60"} />
          <span>All</span>
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                isSelected
                  ? "bg-(--foreground) text-white shadow-sm"
                  : "border border-(--line) bg-(--surface) text-(--muted) hover:border-(--foreground) hover:text-(--foreground)"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}