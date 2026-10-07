export interface Category {
  id: number;
  name: string;
  description: string | null;
}


export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number | string;
  image_url: string | null;
  stock: number;
  is_available: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
}


export interface Order {
  id: number;
  customer_name: string;
  phone: string;
  delivery_address: string;
  total_amount: number | string;
  payment_method: "PAYHERE" | "WHATSAPP";
  payment_status: string;
  order_status: string;
  items: OrderItem[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}