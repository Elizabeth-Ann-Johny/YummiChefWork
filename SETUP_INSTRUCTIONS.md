# Food Delivery App with Supabase Integration

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Set up Supabase

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Configure Database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase_schema.sql` to create the necessary tables

3. **Update Configuration**
   - Open `lib/supabase.ts`
   - Replace `YOUR_SUPABASE_URL` with your project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon key

4. **Theme Configuration**
   - The app uses a custom theme located at `lib/theme.ts`
   - Colors: Warm beige (#FFF3DC) and dark brown (#482E1D) color scheme
   - Fonts: Custom font styles for headings and labels

### 3. Database Schema

The app uses the following tables:

#### `profiles`
- Stores user profile information
- Automatically created when a user signs up

#### `cart_items`
- Stores user-specific cart items
- Links to user via `user_id`

#### `user_settings`
- Stores user preferences like tip amount
- One record per user

### 4. Authentication Flow

The app implements a complete authentication flow:

1. **Unauthenticated users** see login/signup screens
2. **Authenticated users** can access the main app with their personal cart
3. **Cart data** is automatically synced with Supabase
4. **Tips** are saved per user in the database

### 5. Key Features

#### User-Specific Carts
- Each user has their own cart stored in the database
- Cart items persist across app sessions
- Real-time sync with Supabase

#### Authentication
- Email/password authentication
- User profiles with full name
- Secure logout functionality

#### Database Integration
- All cart operations are database-backed
- Row Level Security (RLS) ensures users can only access their own data
- Automatic user setup on registration

### 6. File Structure

```
app/
├── _layout.tsx              # Root layout with auth handling
├── auth/
│   ├── _layout.tsx         # Auth layout
│   ├── login.tsx           # Login screen
│   └── signup.tsx          # Signup screen
├── (tabs)/
│   ├── _layout.tsx         # Tab navigation
│   ├── home/
│   │   └── index.tsx       # Home screen
│   ├── cart/
│   │   └── index.tsx       # Cart screen
│   └── profile/
│       └── index.tsx       # Profile screen
└── delivery-address/
    └── index.tsx           # Delivery address screen

contexts/
├── AuthContext.tsx         # Authentication context
└── CartContext.tsx         # Cart context with Supabase

lib/
└── supabase.ts            # Supabase configuration
```

### 7. Running the App

```bash
npm start
# or
yarn start
```

### 8. Testing the Integration

1. **Sign up** with a new account
2. **Add items** to cart from the home screen
3. **Switch to cart** tab to see items
4. **Add tips** and see them persist
5. **Log out** and log back in to see cart persistence
6. **Create another account** to test user separation

### 9. Security Features

- **Row Level Security (RLS)** on all tables
- **User-specific data access** only
- **Secure authentication** with Supabase Auth
- **Auto-cleanup** when users are deleted

### 10. Development Notes

#### Adding New Cart Operations
All cart operations are async and database-backed:

```typescript
// Add to cart
await addToCart(dish);

// Update quantity
await updateQuantity(itemId, newQuantity);

// Remove from cart
await removeFromCart(itemId);

// Clear cart
await clearCart();

// Set tip amount
await setTipAmount(amount);
```

#### Error Handling
- Database errors are logged to console
- User-friendly error messages in UI
- Graceful fallbacks for offline scenarios

#### Performance Considerations
- Cart syncs on user login
- Optimistic updates for better UX
- Loading states during async operations

### 11. Troubleshooting

#### Common Issues

1. **"useCart is not a function"**
   - Ensure CartProvider wraps your app
   - Check that AuthProvider is above CartProvider

2. **Database connection issues**
   - Verify Supabase URL and key are correct
   - Check if RLS policies are enabled

3. **Authentication not working**
   - Confirm email verification if required
   - Check Supabase auth settings

4. **Cart not syncing**
   - Ensure user is authenticated
   - Check database permissions
   - Verify RLS policies

### 12. Next Steps

Consider adding:
- Order history tracking
- Push notifications for orders
- Real-time updates across devices
- Payment integration
- Restaurant management features

## 📱 Usage

1. **Sign up** for a new account
2. **Browse** food items on the home screen
3. **Add items** to your personal cart
4. **Customize** quantity and add tips
5. **Proceed** to checkout
6. **Sign out** and sign back in to see persistence

Your cart data is automatically saved and synced with Supabase! 🎉