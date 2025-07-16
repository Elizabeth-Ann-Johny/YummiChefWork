import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

const theme = {
  COLORS: {
    primary: '#FFFFFF',
    background: '#F5F5F5',
    accent: '#FF6B6B',
    text: '#333333',
    white: '#FFFFFF',
    gray: '#E0E0E0',
    border: '#DDDDDD',
  }
};

function RootLayoutNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.accent} />
      </View>
    );
  }

  return (
    <Stack>
      {user ? (
        // Authenticated screens
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="delivery-address" options={{ headerShown: false }} />
        </>
      ) : (
        // Authentication screens
        <>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.background,
  },
});