# Cart Table Migration Guide

## 🚀 Overview

Your cart system has been upgraded to use a **normalized database structure** similar to your favorites table. This provides better performance, data integrity, and follows database best practices.

## 📊 What Changed

### Old Structure (`cart_items` table)
```sql
cart_items {
  id: UUID
  user_id: UUID
  dish_id: TEXT
  name: TEXT          -- Duplicated data
  description: TEXT   -- Duplicated data
  price: DECIMAL      -- Duplicated data
  image: TEXT         -- Duplicated data
  quantity: INTEGER
  cooking_time: INTEGER -- Duplicated data
  rating: DECIMAL      -- Duplicated data
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### New Structure (`cart` table)
```sql
cart {
  id: SERIAL          -- Now integer instead of UUID
  user_id: UUID
  dish_id: UUID       -- Now UUID, references dishes table
  quantity: INTEGER
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}

-- Plus a view for easy querying:
cart_with_dishes {
  -- All cart fields +
  -- All dish fields (name, description, price, image, etc.)
}
```

## ✅ Key Improvements

### 1. **Normalized Structure**
- No more duplicated dish data in cart
- References dishes table via foreign key
- Follows database normalization principles

### 2. **Unique Constraint**
- `(user_id, dish_id)` unique constraint
- Prevents duplicate cart entries
- Automatic quantity updates when adding same dish

### 3. **Better Performance**
- Proper indexes on user_id, dish_id
- Smaller cart table size
- Faster queries with optimized joins

### 4. **Upsert Functionality**
- `add_to_cart()` function handles insert/update logic
- Adding same dish increases quantity automatically
- Cleaner application code

### 5. **Consistent with Favorites**
- Both cart and favorites tables have similar structure
- Same patterns for user-dish relationships

## 🔧 Implementation Details

### Database Changes

1. **New Cart Table**
   ```sql
   CREATE TABLE public.cart (
     id serial PRIMARY KEY,
     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
     dish_id uuid REFERENCES dishes(id) ON DELETE CASCADE,
     quantity integer DEFAULT 1 CHECK (quantity > 0),
     created_at timestamp with time zone DEFAULT now(),
     updated_at timestamp with time zone DEFAULT now(),
     UNIQUE(user_id, dish_id)
   );
   ```

2. **Cart with Dishes View**
   ```sql
   CREATE VIEW cart_with_dishes AS
   SELECT c.*, d.name, d.description, d.price, d.image, d.cooking_time, d.rating
   FROM cart c
   JOIN dishes d ON c.dish_id = d.id;
   ```

3. **Upsert Function**
   ```sql
   CREATE FUNCTION add_to_cart(user_id uuid, dish_id uuid, quantity int)
   RETURNS cart AS $$
   -- Handles insert/update logic automatically
   $$;
   ```

### Application Changes

1. **ID Type Change**
   - Cart item IDs are now `number` instead of `string`
   - Updated TypeScript types accordingly

2. **Database Queries**
   - Uses `cart_with_dishes` view for fetching cart data
   - Uses `add_to_cart()` function for adding items
   - Direct cart table operations for update/delete

3. **Context Updates**
   - `addToCart()` now uses RPC call to `add_to_cart`
   - `syncCart()` queries `cart_with_dishes` view
   - All operations handle new ID types

## 🔄 Migration Steps

### For New Installations
1. Run `database/schema.sql` - includes new cart table structure
2. Your app is ready to use the new normalized cart system

### For Existing Installations
1. **Back up your data** first!
2. Run `database/migration_to_normalized_cart.sql`
3. This will:
   - Create new cart table
   - Migrate existing cart_items data
   - Set up proper indexes and constraints
   - Create the cart_with_dishes view
   - Set up RLS policies

3. **Test thoroughly** with your updated application code
4. Once confirmed working, uncomment the DROP TABLE line in the migration script

## 📱 Application Updates

### CartContext Changes
```typescript
// OLD
export type CartItem = {
  id: string;           // Was string
  // ... other fields
};

// NEW
export type CartItem = {
  id: number;           // Now number
  // ... other fields
};
```

### Function Signatures
```typescript
// OLD
removeFromCart: (itemId: string) => Promise<void>;
updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;

// NEW
removeFromCart: (itemId: number) => Promise<void>;
updateQuantity: (itemId: number, newQuantity: number) => Promise<void>;
```

## 🎯 Usage Examples

### Adding to Cart
```typescript
// Before: Complex logic to check if item exists
const existingItem = cartItems.find(item => item.dishId === dish.id);
if (existingItem) {
  await updateQuantity(existingItem.id, existingItem.quantity + 1);
} else {
  // Insert new item with all dish details
}

// After: Simple upsert
await addToCart(dish); // Automatically handles duplicates
```

### Querying Cart
```typescript
// Before: Query cart_items with all duplicated data
const { data } = await supabase
  .from('cart_items')
  .select('*')
  .eq('user_id', user.id);

// After: Query cart_with_dishes view for clean join
const { data } = await supabase
  .from('cart_with_dishes')
  .select('*')
  .eq('user_id', user.id);
```

## 🔒 Security Features

- **Row Level Security (RLS)** on cart table
- **Proper foreign key constraints** ensure data integrity
- **Unique constraints** prevent duplicate entries
- **Check constraints** ensure quantity > 0

## 🧪 Testing

1. **Sign up** with a new account
2. **Add items** to cart multiple times (should increase quantity)
3. **Update quantities** using cart controls
4. **Remove items** from cart
5. **Clear cart** functionality
6. **Log out and back in** to verify persistence

## 📈 Performance Benefits

- **Smaller cart table** (no duplicated dish data)
- **Faster queries** with proper indexes
- **Efficient joins** via cart_with_dishes view
- **Reduced storage** requirements
- **Better scalability** for large datasets

## 🔧 Troubleshooting

### Common Issues

1. **"dish_id must be UUID"**
   - Ensure your dishes table uses UUID for id field
   - Check dish.id format when calling addToCart

2. **"Unique constraint violation"**
   - This is expected behavior - use the add_to_cart function
   - It automatically handles duplicates by updating quantity

3. **"Foreign key constraint fails"**
   - Ensure the dish exists in dishes table
   - Check that dish_id references are valid UUIDs

### Database Verification

```sql
-- Check cart table structure
\d cart;

-- Check cart_with_dishes view
\d cart_with_dishes;

-- Verify indexes
\di cart*;

-- Check RLS policies
\dp cart;
```

## 🎉 Benefits Summary

✅ **Normalized database structure**  
✅ **Automatic duplicate handling**  
✅ **Better performance with indexes**  
✅ **Consistent with favorites table**  
✅ **Proper foreign key relationships**  
✅ **Cleaner application code**  
✅ **Reduced data redundancy**  
✅ **Enhanced data integrity**  

Your cart system is now production-ready with industry-standard database design! 🚀