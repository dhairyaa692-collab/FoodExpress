import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem, Order } from '../types/index.ts';

interface CartContextType {
  items: CartItem[];
  addToCart: (food: FoodItem, quantity?: number) => void;
  removeFromCart: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (order: Order | null) => void;
  isOrderConfirmationOpen: boolean;
  setIsOrderConfirmationOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('fx_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fx_cart_items', JSON.stringify(items));
    } catch (err) {
      console.error('Error saving cart to local storage:', err);
    }
  }, [items]);

  const addToCart = (food: FoodItem, quantity = 1) => {
    if (!food.isAvailable) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.foodItem.id === food.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { foodItem: food, quantity }];
    });
  };

  const removeFromCart = (foodId: string) => {
    setItems((prev) => prev.filter((i) => i.foodItem.id !== foodId));
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.foodItem.id === foodId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = Number(
    items.reduce((acc, item) => acc + item.foodItem.price * item.quantity, 0).toFixed(2)
  );

  // Free delivery for orders over ₹499, else ₹40. If cart empty, fee is 0
  const deliveryFee = items.length === 0 ? 0 : subtotal >= 499 ? 0 : 40;

  const totalAmount = Number((subtotal + deliveryFee).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        lastPlacedOrder,
        setLastPlacedOrder,
        isOrderConfirmationOpen,
        setIsOrderConfirmationOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
