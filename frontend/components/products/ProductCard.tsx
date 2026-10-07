import Link from "next/link";
import type { Product } from "@/types";
import { ArrowUpRight } from "lucide-react";


interface ProductCardProps {
  product: Product;
}


function formatPrice(price: number | string) {
  return `Rs. ${Number(price).toLocaleString("en-LK")}`;
}


export default function ProductCard({
  product,
}: ProductCardProps) {
  const unavailable =
    !product.is_available || product.stock <= 0;

  return (
    <article className="group overflow-hidden border border-(--line) bg-(--surface)">
      <Link
        href={`/products/${product.id}`}
        className="block"
      >
        <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-[#e6dfd2]">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <span className="text-6xl">
              🍽️
            </span>
          )}

          {unavailable && (
            <div className="absolute left-4 top-4 bg-(--foreground) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              Sold out
            </div>
          )}

          <div className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="p-5">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold tracking-tight">
              {product.name}
            </h3>

            <span className="whitespace-nowrap text-sm font-medium">
              {formatPrice(product.price)}
            </span>
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-(--muted)">
            {product.description ||
              "Freshly prepared and made to order."}
          </p>
        </div>
      </Link>
    </article>
  );
}