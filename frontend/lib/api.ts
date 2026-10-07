const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Keep default message if response is not JSON
    }

    throw new Error(message);
  }

  return response.json();
}


export async function getCategories() {
  return apiRequest<Category[]>(
    "/api/categories"
  );
}


export async function getProducts(params?: {
  search?: string;
  category_id?: number;
  available_only?: boolean;
}) {
  const query = new URLSearchParams();

  if (params?.search) {
    query.set("search", params.search);
  }

  if (params?.category_id) {
    query.set(
      "category_id",
      String(params.category_id)
    );
  }

  if (params?.available_only) {
    query.set("available_only", "true");
  }

  const queryString = query.toString();

  return apiRequest<Product[]>(
    `/api/products${queryString ? `?${queryString}` : ""}`
  );
}


export async function getProduct(productId: number) {
  return apiRequest<Product>(
    `/api/products/${productId}`
  );
}


import type {
  Category,
  Product,
} from "@/types";