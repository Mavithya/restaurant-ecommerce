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