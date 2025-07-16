import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface FavoritesContextType {
  favoriteIds: string[];
  addFavorite: (dishId: string) => Promise<void>;
  removeFavorite: (dishId: string) => Promise<void>;
  isFavorite: (dishId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial user and favorites
    const initializeFavorites = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        setUser(userData.user);
        await fetchFavorites(userData.user.id);
      }
    };

    initializeFavorites();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchFavorites(session.user.id);
      } else {
        setUser(null);
        setFavoriteIds([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchFavorites = async (userId: string) => {
    try {
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select('dish_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      const ids = favoritesData?.map(fav => fav.dish_id) || [];
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const addFavorite = async (dishId: string) => {
    if (!user) {
      throw new Error('User must be logged in to add favorites');
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, dish_id: dishId });

      if (error) {
        console.error('Error adding favorite:', error);
        throw error;
      }

      setFavoriteIds(prev => [...prev, dishId]);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  };

  const removeFavorite = async (dishId: string) => {
    if (!user) {
      throw new Error('User must be logged in to remove favorites');
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('dish_id', dishId);

      if (error) {
        console.error('Error removing favorite:', error);
        throw error;
      }

      setFavoriteIds(prev => prev.filter(id => id !== dishId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  };

  const isFavorite = (dishId: string) => {
    return favoriteIds.includes(dishId);
  };

  const refreshFavorites = async () => {
    if (user) {
      await fetchFavorites(user.id);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        addFavorite,
        removeFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};