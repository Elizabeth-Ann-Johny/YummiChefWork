import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
  id: string;
  dishId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  cookingTime: number;
  rating: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (dish: any) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  getFoodCost: () => number;
  getTaxAmount: () => number;
  getTipAmount: () => number;
  setTipAmount: (amount: number) => void;
  getTotalAmount: () => number;
  getItemCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tipAmount, setTipAmount] = useState<number>(0);

  const addToCart = (dish: any) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.dishId === dish.id);
      
      if (existingItem) {
        // If item already exists, increase quantity
        return prev.map(item =>
          item.dishId === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: `${dish.id}-${Date.now()}`,
          dishId: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
          image: dish.image,
          quantity: 1,
          cookingTime: dish.cookingTime,
          rating: dish.rating,
        };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setTipAmount(0);
  };

  const getFoodCost = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTaxAmount = () => {
    return getFoodCost() * 0.03; // 3% tax
  };

  const getTipAmount = () => {
    return tipAmount;
  };

  const getTotalAmount = () => {
    return getFoodCost() + getTaxAmount() + getTipAmount();
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getFoodCost,
    getTaxAmount,
    getTipAmount,
    setTipAmount,
    getTotalAmount,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};