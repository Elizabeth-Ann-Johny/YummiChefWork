-- ============================================
-- CART TABLE CREATION SCRIPT FOR SUPABASE
-- ============================================
-- Run this script in your Supabase SQL Editor

-- Step 1: Create the cart table
CREATE TABLE public.cart (
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

-- Step 2: Create indexes for better performance
CREATE INDEX idx_cart_user_id ON public.cart USING btree (user_id);
CREATE INDEX idx_cart_dish_id ON public.cart USING btree (dish_id);
CREATE INDEX idx_cart_user_dish ON public.cart USING btree (user_id, dish_id);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view own cart items" ON public.cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart
    FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Create the cart_with_dishes view for easy querying
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

-- Step 6: Set up permissions for the view
GRANT SELECT ON public.cart_with_dishes TO authenticated;

-- Step 7: Create the add_to_cart function for upsert functionality
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
        updated_at = now()
    RETURNING * INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger for updated_at
CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON public.cart
    FOR EACH ROW EXECUTE FUNCTION public.update_cart_updated_at();

-- ============================================
-- VERIFICATION QUERIES (Optional - run to verify)
-- ============================================

-- Check if table was created successfully
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cart' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'cart' AND schemaname = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'cart';

-- Check if view exists
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_name = 'cart_with_dishes' AND table_schema = 'public';

-- Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'add_to_cart' AND routine_schema = 'public';

-- Test the add_to_cart function (replace with actual UUIDs)
-- SELECT * FROM add_to_cart('your-user-id'::uuid, 'your-dish-id'::uuid, 1);