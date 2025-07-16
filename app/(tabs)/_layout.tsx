import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CartProvider, useCart } from '../contexts/CartContext';
import { theme } from '../lib/theme';
import { Text, View } from 'react-native';

// Cart Badge Component
function CartBadge() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  if (itemCount === 0) return null;

  return (
    <View style={{
      position: 'absolute',
      top: -5,
      right: -5,
      backgroundColor: '#FF4444',
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
        {itemCount > 99 ? '99+' : itemCount}
      </Text>
    </View>
  );
}

// Cart Tab Icon with Badge
function CartTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={{ position: 'relative' }}>
      <MaterialIcons
        name="shopping-cart"
        size={24}
        color={focused ? theme.COLORS.accent : theme.COLORS.text}
      />
      <CartBadge />
    </View>
  );
}

function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.COLORS.accent,
        tabBarInactiveTintColor: theme.COLORS.text,
        tabBarStyle: {
          backgroundColor: theme.COLORS.white,
          borderTopWidth: 1,
          borderTopColor: theme.COLORS.border,
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="home"
              size={24}
              color={focused ? theme.COLORS.accent : theme.COLORS.text}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="favorite"
              size={24}
              color={focused ? theme.COLORS.accent : theme.COLORS.text}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <CartTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="person"
              size={24}
              color={focused ? theme.COLORS.accent : theme.COLORS.text}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <CartProvider>
      <TabsLayout />
    </CartProvider>
  );
}