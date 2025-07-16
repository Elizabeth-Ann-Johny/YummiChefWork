import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          dish_id: string;
          name: string;
          description: string;
          price: number;
          image: string;
          quantity: number;
          cooking_time: number;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dish_id: string;
          name: string;
          description: string;
          price: number;
          image: string;
          quantity: number;
          cooking_time: number;
          rating: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dish_id?: string;
          name?: string;
          description?: string;
          price?: number;
          image?: string;
          quantity?: number;
          cooking_time?: number;
          rating?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          tip_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tip_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tip_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};