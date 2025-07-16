import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type CartItem = {
  id: number;
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
  loading: boolean;
  addToCart: (dish: any) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getFoodCost: () => number;
  getTaxAmount: () => number;
  getTipAmount: () => number;
  setTipAmount: (amount: number) => Promise<void>;
  getTotalAmount: () => number;
  getItemCount: () => number;
  syncCart: () => Promise<void>;
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
  const [tipAmount, setTipAmountState] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart and tip amount when user changes
  useEffect(() => {
    if (user) {
      syncCart();
      loadTipAmount();
    } else {
      setCartItems([]);
      setTipAmountState(0);
    }
  }, [user]);

  const syncCart = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_with_dishes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error syncing cart:', error);
        return;
      }

      const formattedItems: CartItem[] = data.map(item => ({
        id: item.id,
        dishId: item.dish_id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        cookingTime: item.cooking_time,
        rating: item.rating,
      }));

      setCartItems(formattedItems);
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTipAmount = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('tip_amount')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading tip amount:', error);
        return;
      }

      setTipAmountState(data.tip_amount || 0);
    } catch (error) {
      console.error('Error loading tip amount:', error);
    }
  };

  const addToCart = async (dish: any) => {
    if (!user) {
      console.error('User must be logged in to add items to cart');
      return;
    }

    setLoading(true);
    try {
      // Use the add_to_cart function for upsert functionality
      const { data, error } = await supabase
        .rpc('add_to_cart', {
          p_user_id: user.id,
          p_dish_id: dish.id,
          p_quantity: 1
        });

      if (error) {
        console.error('Error adding to cart:', error);
        return;
      }

      // Refresh cart data from the database
      await syncCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing from cart:', error);
        return;
      }

      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (!user) return;

    if (newQuantity === 0) {
      await removeFromCart(itemId);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating quantity:', error);
        return;
      }

      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        return;
      }

      setCartItems([]);
      await setTipAmount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const setTipAmount = async (amount: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ tip_amount: amount })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error setting tip amount:', error);
        return;
      }

      setTipAmountState(amount);
    } catch (error) {
      console.error('Error setting tip amount:', error);
    }
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
    loading,
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
    syncCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};