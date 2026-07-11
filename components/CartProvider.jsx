'use client';

import { createContext, useContext } from 'react';

const CartContext = createContext({
  addToCart: () => {},
});

export function CartProvider({ value, children }) {
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
