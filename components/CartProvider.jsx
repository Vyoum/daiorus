'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'daiorus_cart';

const CartContext = createContext({
  cart: [],
  ready: false,
  totalItems: 0,
  subtotal: 0,
  addToCart: () => {},
  updateQty: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  setCart: () => {},
});

function readStoredCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore quota / private mode
    }
  }, [cart, ready]);

  const addToCart = useCallback((product) => {
    if (!product?.id) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          material: product.material || null,
          slug: product.slug || null,
          qty: 1,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((id, change) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const qty = item.qty + change;
          return qty > 0 ? { ...item, qty } : null;
        })
        .filter(Boolean),
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      ready,
      totalItems,
      subtotal,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      setCart,
    }),
    [cart, ready, totalItems, subtotal, addToCart, updateQty, removeFromCart, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
