import type {
  Category,
  Product,
  Order,
} from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY =
  "kora-access-token";


async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {

  const headers = new Headers(
    options?.headers
  );

  if (
    options?.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (
    typeof window !== "undefined"
  ) {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
      cache: "no-store",
    }
  );

  if (!response.ok) {

    if (
      response.status === 401 &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(
        TOKEN_KEY
      );
    }

    let message =
      "Something went wrong";

    try {
      const errorData =
        await response.json();

      message =
        errorData.detail ||
        message;

    } catch {
      // Keep default message
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

export interface AdminDashboardStats {
  total_products: number;
  active_products: number;
  low_stock_products: {
    id: number;
    name: string;
    stock: number;
  }[];
  total_categories: number;
  total_orders: number;
  pending_orders: number;
  paid_revenue: number | string;
  
}

export interface AdminOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  product?: {
    id: number;
    name: string;
  };
}

export interface AdminOrder {
  id: number;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total_amount: number | string;
  payment_method: "PAYHERE" | "WHATSAPP";
  payment_status: string;
  order_status: string;
  items: AdminOrderItem[];
}


export async function getAdminDashboardStats() {
  return apiRequest<AdminDashboardStats>(
    "/api/admin/dashboard"
  );
}




export interface ProductCreatePayload {
  name: string;
  description: string;
  price: number;
  category_id: number;
  stock: number;
  image_url: string | null;
  is_available: boolean;
}


export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  price?: number;
  category_id?: number;
  stock?: number;
  image_url?: string | null;
  is_available?: boolean;
}


export async function createProduct(
  payload: ProductCreatePayload
) {
  return apiRequest<Product>(
    "/api/products",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}


export async function updateProduct(
  productId: number,
  payload: ProductUpdatePayload
) {
  return apiRequest<Product>(
    `/api/products/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}


export async function deleteProduct(
  productId: number
) {
  return apiRequest<{
    message: string;
  }>(
    `/api/products/${productId}`,
    {
      method: "DELETE",
    }
  );
}


export interface CategoryPayload {
  name: string;
  description: string | null;
}


export async function createCategory(
  payload: CategoryPayload
) {
  return apiRequest<Category>(
    "/api/categories",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}


export async function updateCategory(
  categoryId: number,
  payload: Partial<CategoryPayload>
) {
  return apiRequest<Category>(
    `/api/categories/${categoryId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}


export async function deleteCategory(
  categoryId: number
) {
  return apiRequest<{
    message: string;
  }>(
    `/api/categories/${categoryId}`,
    {
      method: "DELETE",
    }
  );
}

export interface AdminOrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;

  product?: {
    id: number;
    name: string;
  };
}


export interface AdminOrder {
  id: number;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total_amount: number | string;

  payment_method:
    | "PAYHERE"
    | "WHATSAPP";

  payment_status: string;
  order_status: string;

  items: AdminOrderItem[];
}


export async function getAdminOrders() {
  return apiRequest<AdminOrder[]>(
    "/api/admin/orders"
  );
}


export async function updateAdminOrderStatus(
  orderId: number,
  orderStatus: string
) {
  return apiRequest<{
    message: string;
    order_id: number;
    order_status: string;
  }>(
    `/api/admin/orders/${orderId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: orderStatus,
      }),
    }
  );
}

export interface ImageUploadResponse {
  secure_url: string;
  public_id: string;
}


export async function uploadProductImage(
  file: File
) {
  const formData = new FormData();

  formData.append(
    "file",
    file
  );

  return apiRequest<ImageUploadResponse>(
    "/api/admin/upload-image",
    {
      method: "POST",
      body: formData,
    }
  );
}