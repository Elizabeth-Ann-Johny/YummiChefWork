# Troubleshooting Guide - Dishes Not Loading on Homepage

## Issues Fixed in Your Code

### 1. **Data Type Mismatches (FIXED)**
- **Problem**: Your table uses `uuid` for `id` but TypeScript expected `number`
- **Solution**: Updated types to use `string` for UUIDs

### 2. **Null Safety Issues (FIXED)**
- **Problem**: Database columns allow `NULL` but TypeScript expected non-null values
- **Solution**: Added null checks and default values

### 3. **Missing Columns (FIXED)**
- **Problem**: TypeScript was missing `chef_id`, `alergens`, `created_at` fields
- **Solution**: Added all missing fields to TypeScript interfaces

## Most Common Issues and Solutions

### Issue 1: Empty Table
**Symptom**: No dishes appear, no errors in console
**Solution**: 
1. Run the `insert_sample_dishes.sql` script in Supabase SQL Editor
2. Check your table has data: `SELECT * FROM dishes LIMIT 5;`

### Issue 2: Row Level Security (RLS) Blocking Access
**Symptom**: Error about "permission denied" or empty results
**Solution**:
1. Go to Supabase Dashboard → Table Editor → dishes table
2. Check if RLS is enabled (yellow warning banner)
3. **Option A**: Disable RLS temporarily:
   ```sql
   ALTER TABLE public.dishes DISABLE ROW LEVEL SECURITY;
   ```
4. **Option B**: Create a policy to allow read access:
   ```sql
   CREATE POLICY "Allow public read access" ON public.dishes
   FOR SELECT TO public
   USING (true);
   ```

### Issue 3: Table Name Case Sensitivity
**Symptom**: "Table 'dishes' does not exist" error
**Solution**: Check your table name in Supabase dashboard. If it's "DISHES", update your code:
```typescript
.from('DISHES')  // Instead of .from('dishes')
```

### Issue 4: Column Name Mismatches
**Symptom**: Some data missing or undefined values
**Solution**: Verify your table has all these columns:
- `chef_id` (uuid)
- `name` (text)
- `description` (text)
- `image` (text)
- `alergens` (text) ← Note the typo
- `cooking_time` (double precision)
- `price` (numeric)
- `rating` (numeric)
- `spice_level` (integer)
- `service_type` (varchar)
- `cuisine` (varchar)
- `ingredients` (text[])
- `dietary_type` (varchar)

### Issue 5: Missing Favorites Table
**Symptom**: Favorites functionality not working
**Solution**: Create the favorites table:
```sql
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    dish_id uuid not null,
    created_at timestamp without time zone default now(),
    constraint favorites_pkey primary key (id),
    constraint favorites_dish_id_fkey foreign key (dish_id) references dishes(id) on delete cascade,
    constraint favorites_user_id_dish_id_unique unique (user_id, dish_id)
);
```

## Debugging Steps

### Step 1: Check Console Logs
Open your app's console and look for:
```
Fetching dishes from Supabase...
Dishes query result: { dishesData: [...], dishesError: null }
```

### Step 2: Test Direct Query
In Supabase SQL Editor, run:
```sql
SELECT COUNT(*) FROM public.dishes;
SELECT * FROM public.dishes LIMIT 3;
```

### Step 3: Check Network Tab
1. Open browser dev tools → Network tab
2. Refresh your app
3. Look for requests to `supabase.co` - should see a successful response

### Step 4: Verify Supabase Connection
Make sure your `supabase.ts` file has correct:
- Project URL
- Anon key
- Proper initialization

## Quick Fix Checklist

1. ✅ **Run sample data script**: `insert_sample_dishes.sql`
2. ✅ **Disable RLS temporarily**: `ALTER TABLE public.dishes DISABLE ROW LEVEL SECURITY;`
3. ✅ **Check table name**: Ensure it's exactly `dishes` (lowercase)
4. ✅ **Verify data exists**: `SELECT COUNT(*) FROM dishes;`
5. ✅ **Check console logs**: Look for fetch errors
6. ✅ **Test app**: Refresh and check if dishes appear

## Expected Behavior After Fixes

1. **Console logs**: Should show successful data fetch
2. **Homepage**: Should display dish cards with images
3. **Filtering**: Should work with cuisine, price, etc.
4. **Sorting**: Should work by rating, price, cooking time
5. **Favorites**: Should work if user is logged in

## Still Not Working?

If dishes still don't appear after following these steps:

1. **Share console logs**: Check what the `console.log` statements show
2. **Check Supabase logs**: Go to Supabase Dashboard → Logs
3. **Verify schema**: Ensure all column names match exactly
4. **Test with minimal data**: Insert one simple dish manually

The most common issue is RLS blocking access - try disabling it first to confirm everything else works.