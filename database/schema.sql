-- Food Delivery App - Supabase Database Schema
-- Run this script in your Supabase SQL Editor to set up the database

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cart table (normalized to reference dishes table)
CREATE TABLE IF NOT EXISTS public.cart (
    id serial NOT NULL,
    user_id uuid NOT NULL,
    dish_id uuid NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT cart_pkey PRIMARY KEY (id),
    CONSTRAINT cart_dish_id_fkey FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE,
    CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
    CONSTRAINT cart_quantity_check CHECK (quantity > 0),
    CONSTRAINT cart_user_dish_unique UNIQUE (user_id, dish_id)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
    tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for cart
CREATE POLICY "Users can view own cart items" ON public.cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_settings (user_id, tip_amount)
    VALUES (NEW.id, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON public.cart
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for cart table for better performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_dish_id ON public.cart USING btree (dish_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_dish ON public.cart USING btree (user_id, dish_id);

-- Create a view that joins cart with dishes for easier querying
CREATE VIEW public.cart_with_dishes AS
SELECT 
    c.id,
    c.user_id,
    c.dish_id,
    c.quantity,
    c.created_at,
    c.updated_at,
    d.name,
    d.description,
    d.price,
    d.image,
    d.cooking_time,
    d.rating
FROM public.cart c
JOIN public.dishes d ON c.dish_id = d.id;

-- Set up RLS for the view
ALTER VIEW public.cart_with_dishes OWNER TO postgres;
GRANT SELECT ON public.cart_with_dishes TO authenticated;

-- Function to add or update cart item (upsert)
CREATE OR REPLACE FUNCTION public.add_to_cart(
    p_user_id uuid,
    p_dish_id uuid,
    p_quantity integer DEFAULT 1
)
RETURNS public.cart AS $$
DECLARE
    result public.cart;
BEGIN
    -- Try to insert, on conflict update quantity
    INSERT INTO public.cart (user_id, dish_id, quantity)
    VALUES (p_user_id, p_dish_id, p_quantity)
    ON CONFLICT (user_id, dish_id)
    DO UPDATE SET 
        quantity = cart.quantity + p_quantity,
        updated_at = NOW()
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;