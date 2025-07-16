import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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
  loading: boolean;
  addToCart: (dish: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
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
        .from('cart_items')
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
      // Check if item already exists
      const existingItem = cartItems.find(item => item.dishId === dish.id);
      
      if (existingItem) {
        // Update quantity
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            dish_id: dish.id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            image: dish.image,
            quantity: 1,
            cooking_time: dish.cookingTime,
            rating: dish.rating,
          }])
          .select()
          .single();

        if (error) {
          console.error('Error adding to cart:', error);
          return;
        }

        const newItem: CartItem = {
          id: data.id,
          dishId: data.dish_id,
          name: data.name,
          description: data.description,
          price: data.price,
          image: data.image,
          quantity: data.quantity,
          cookingTime: data.cooking_time,
          rating: data.rating,
        };

        setCartItems(prev => [...prev, newItem]);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
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

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!user) return;

    if (newQuantity === 0) {
      await removeFromCart(itemId);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
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
        .from('cart_items')
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