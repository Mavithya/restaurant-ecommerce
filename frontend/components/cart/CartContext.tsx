"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "@/types";


export interface CartItem {
  product: Product;
  quantity: number;
}


interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;

  addToCart: (
    product: Product,
    quantity?: number
  ) => void;

  updateQuantity: (
    productId: number,
    quantity: number
  ) => void;

  removeFromCart: (
    productId: number
  ) => void;

  clearCart: () => void;
}


const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );


const STORAGE_KEY =
  "kora-shopping-cart";


export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>(
    []
  );

  const [loaded, setLoaded] =
    useState(false);


  // Load cart from localStorage
  useEffect(() => {
    try {
      const storedCart =
        localStorage.getItem(STORAGE_KEY);

      if (storedCart) {
        const parsedCart =
          JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );
    } finally {
      setLoaded(true);
    }
  }, []);


  // Save cart to localStorage
  useEffect(() => {
    if (!loaded) {
      return;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [items, loaded]);


  function addToCart(
    product: Product,
    quantity = 1
  ) {
    if (
      !product.is_available ||
      product.stock <= 0
    ) {
      return;
    }

    setItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            item.product.id === product.id
        );

      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stock
        );

        return currentItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          product,
          quantity: Math.min(
            quantity,
            product.stock
          ),
        },
      ];
    });
  }


  function updateQuantity(
    productId: number,
    quantity: number
  ) {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (
            item.product.id !== productId
          ) {
            return item;
          }

          const safeQuantity = Math.min(
            Math.max(quantity, 1),
            item.product.stock
          );

          return {
            ...item,
            quantity: safeQuantity,
          };
        })
    );
  }


  function removeFromCart(
    productId: number
  ) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          item.product.id !== productId
      )
    );
  }


  function clearCart() {
    setItems([]);
  }


  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [items]
  );


  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item.product.price) *
            item.quantity,
        0
      ),
    [items]
  );


  const value = {
    items,
    itemCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };


  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}