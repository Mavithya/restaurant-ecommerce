"use client";

import type { Category } from "@/types";


interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (
    categoryId: number | null
  ) => void;
}


export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
          selectedCategory === null
            ? "bg-(--foreground) text-white"
            : "border border-(--line) bg-(--surface) text-(--muted) hover:text-(--foreground)"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() =>
            onCategoryChange(category.id)
          }
          className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
            selectedCategory === category.id
              ? "bg-(--foreground) text-white"
              : "border border-(--line) bg-(--surface) text-(--muted) hover:text-(--foreground)"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}