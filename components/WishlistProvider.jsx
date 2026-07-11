'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'daiorus_wishlist';

const WishlistContext = createContext({
  items: [],
  count: 0,
  isWished: () => false,
  toggle: () => {},
  remove: () => {},
  ready: false,
});

function readStored() {
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

function toWishlistItem(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    material: product.material || null,
    tag: product.tag || null,
    category: product.category || null,
  };
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStored());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota / private mode
    }
  }, [items, ready]);

  const isWished = useCallback(
    (id) => items.some((item) => item.id === id),
    [items],
  );

  const toggle = useCallback((product) => {
    if (!product?.id) return;
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev.filter((item) => item.id !== product.id);
      return [...prev, toWishlistItem(product)];
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isWished,
      toggle,
      remove,
      ready,
    }),
    [items, isWished, toggle, remove, ready],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
