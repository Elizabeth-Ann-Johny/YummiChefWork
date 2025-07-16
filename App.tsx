import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CartProvider } from './contexts/CartContext';
import HomePage from './components/Homepage';
import Cart from './components/Cart';
import DeliveryAddress from './components/DeliveryAddress';

const Stack = createStackNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={HomePage} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Cart" 
            component={Cart} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="DeliveryAddress" 
            component={DeliveryAddress} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}