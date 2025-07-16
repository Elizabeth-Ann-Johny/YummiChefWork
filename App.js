import React, { createContext, useContext, useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from './screens/MenuScreen';
import CartScreen from './screens/CartScreen';
import DeliveryAddressScreen from './screens/DeliveryAddressScreen';

// Cart Context
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
    
    case 'SET_TIP':
      return {
        ...state,
        tip: action.payload
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        tip: 0
      };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    tip: 0
  });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Menu">
          <Stack.Screen 
            name="Menu" 
            component={MenuScreen} 
            options={{ title: 'YummiChef Menu' }}
          />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen} 
            options={{ title: 'Your Cart' }}
          />
          <Stack.Screen 
            name="DeliveryAddress" 
            component={DeliveryAddressScreen} 
            options={{ title: 'Delivery Address' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

export default App;