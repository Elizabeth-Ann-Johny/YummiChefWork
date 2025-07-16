# YummiChef Food Ordering App

A React Native food ordering app with complete cart functionality, automatic pricing calculations, tip system, and delivery address confirmation.

## Features

### ✅ Add to Cart Functionality
- Tap "Add to Cart" on any menu item to add it to your cart
- Items are automatically added with proper quantity and pricing
- Alert confirmation when items are added to cart

### ✅ Smart Cart Management
- Automatic calculation of food cost
- 3% tax calculation on food cost
- $2.00 delivery fee included
- Quantity controls with + and - buttons
- Remove items by reducing quantity to 0

### ✅ Tip System
- Text field to enter custom tip amount
- Green checkmark button to apply tip
- Tip is automatically added to total bill
- Confirmation alert when tip is applied

### ✅ Order Placement
- "Place Order" button navigates to delivery address screen
- Complete address form with validation
- Order summary with all costs displayed
- Order confirmation with estimated delivery time

### ✅ Navigation Flow
1. **Menu Screen** - Browse dishes and add to cart
2. **Cart Screen** - Review items, adjust quantities, add tip
3. **Delivery Address Screen** - Enter delivery details and confirm order

## Color Theme
- Primary Color: `#FF6B35` (Orange)
- Background: `#f5f5f5` (Light Gray)
- Cards: `#fff` (White)
- Text: `#333` (Dark Gray)
- Tip Button: `#4CAF50` (Green)

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
npm run ios
```

3. For Android:
```bash
npm run android
```

## Project Structure
```
├── App.js                 # Main app with navigation and cart context
├── screens/
│   ├── MenuScreen.js      # Food menu with add to cart
│   ├── CartScreen.js      # Cart with calculations and tip
│   └── DeliveryAddressScreen.js # Address form and order confirmation
├── package.json           # Dependencies and scripts
└── metro.config.js        # Metro bundler configuration
```

## Usage

1. **Browse Menu**: View available dishes with prices and descriptions
2. **Add to Cart**: Tap "Add to Cart" on any item
3. **View Cart**: Navigate to cart to see selected items
4. **Adjust Quantities**: Use + and - buttons to modify quantities
5. **Add Tip**: Enter tip amount and tap the green checkmark
6. **Place Order**: Tap "Place Order" to proceed to delivery address
7. **Enter Address**: Fill in delivery details and confirm order

## Menu Items
- 🍕 Margherita Pizza - $10.00
- 🐟 Grilled Salmon - $12.00
- 🥗 Caesar Salad - $8.00
- 🍝 Chicken Pasta - $14.00
- 🍔 Beef Burger - $13.00

## Calculations
- **Food Total**: Sum of all items × quantities
- **Tax**: 3% of food total
- **Delivery Fee**: Fixed $2.00
- **Tip**: Custom amount entered by user
- **Grand Total**: Food + Tax + Delivery + Tip

## Notes
- Empty cart shows "Back to Menu" option
- Order confirmation clears cart and returns to menu
- All prices automatically formatted to 2 decimal places
- Form validation ensures required fields are filled
