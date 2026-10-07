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
  Order
} from "@/types";


export interface CreateOrderItemPayload {
  product_id: number;
  quantity: number;
}


export interface CreateOrderPayload {
  customer_name: string;
  email: string;
  phone: string;
  city: string;
  delivery_address: string;
  payment_method: "PAYHERE" | "WHATSAPP";
  items: CreateOrderItemPayload[];
}

export async function createOrder(
  payload: CreateOrderPayload
) {
  return apiRequest<Order>(
    "/api/orders",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}


import type { PayHerePaymentResponse } from "./payhere";


export async function createPayHerePayment(
  orderId: number
): Promise<PayHerePaymentResponse> {
  return apiRequest<PayHerePaymentResponse>(
    `/api/payments/payhere/create?order_id=${orderId}`,
    {
      method: "POST",
    }
  );
}

export interface WhatsAppOrderResponse {
  order_id: number;
  whatsapp_url: string;
}

export async function getWhatsAppOrderLink(
  orderId: number
): Promise<WhatsAppOrderResponse> {
  return apiRequest<WhatsAppOrderResponse>(
    `/api/orders/${orderId}/whatsapp`
  );
}