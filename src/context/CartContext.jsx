import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sigma_cart") || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("sigma_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, size, color, qty = 1) => {
    setItems(prev => {
      const key = `${product.id}-${size}-${color}`;
      const exists = prev.find(i => i.key === key);
      if (exists) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { key, product, size, color, qty }];
    });
  };

  const removeItem = (key) => setItems(prev => prev.filter(i => i.key !== key));

  const updateQty = (key, qty) => {
    if (qty < 1) { removeItem(key); return; }
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = items.reduce((acc, i) => {
    const price = i.product.discount
      ? i.product.price * (1 - i.product.discount / 100)
      : i.product.price;
    return acc + price * i.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
