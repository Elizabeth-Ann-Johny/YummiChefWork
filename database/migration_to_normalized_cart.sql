-- Migration script to transition from cart_items to normalized cart table
-- Run this script if you have existing cart_items data that you want to migrate

-- Step 1: Create the new cart table (if not already exists)
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

-- Step 2: Migrate data from cart_items to cart (if cart_items table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
        -- Migrate existing cart_items data to cart table
        INSERT INTO public.cart (user_id, dish_id, quantity, created_at, updated_at)
        SELECT 
            user_id::uuid,
            dish_id::uuid,
            quantity,
            created_at,
            updated_at
        FROM public.cart_items
        ON CONFLICT (user_id, dish_id) DO UPDATE SET
            quantity = cart.quantity + EXCLUDED.quantity,
            updated_at = EXCLUDED.updated_at;
        
        RAISE NOTICE 'Migrated data from cart_items to cart table';
    ELSE
        RAISE NOTICE 'cart_items table does not exist, skipping migration';
    END IF;
END $$;

-- Step 3: Set up RLS for cart table
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create policies for cart
DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart;
DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart;
DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart;
DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart;

CREATE POLICY "Users can view own cart items" ON public.cart
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON public.cart
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON public.cart
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON public.cart
    FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_dish_id ON public.cart USING btree (dish_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_dish ON public.cart USING btree (user_id, dish_id);

-- Step 5: Create the cart_with_dishes view
DROP VIEW IF EXISTS public.cart_with_dishes;
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

-- Set up permissions for the view
ALTER VIEW public.cart_with_dishes OWNER TO postgres;
GRANT SELECT ON public.cart_with_dishes TO authenticated;

-- Step 6: Create or update the add_to_cart function
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

-- Step 7: Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cart_updated_at ON public.cart;
CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON public.cart
    FOR EACH ROW EXECUTE FUNCTION public.update_cart_updated_at();

-- Step 8: Optional - Drop the old cart_items table after confirming migration
-- UNCOMMENT THE FOLLOWING LINES ONLY AFTER CONFIRMING THE MIGRATION WAS SUCCESSFUL
-- AND YOU'VE UPDATED YOUR APPLICATION CODE TO USE THE NEW CART TABLE

-- DROP TABLE IF EXISTS public.cart_items;

RAISE NOTICE 'Migration completed successfully!';
RAISE NOTICE 'Please update your application code to use the new cart table structure.';
RAISE NOTICE 'After confirming everything works, you can uncomment the DROP TABLE statement to remove cart_items.';