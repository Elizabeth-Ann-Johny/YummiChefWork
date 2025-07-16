import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../../../contexts/CartContext';

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

export default function Profile() {
  const { clearCart, getItemCount } = useCart();

  const handleClearCart = () => {
    clearCart();
    alert('Cart cleared!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Profile Screen</Text>
        <Text style={styles.subtitle}>
          This is a placeholder profile screen. You can add user information, 
          settings, order history, and other profile features here.
        </Text>
        
        <View style={styles.cartInfoContainer}>
          <MaterialIcons name="shopping-cart" size={24} color={theme.COLORS.accent} />
          <Text style={styles.cartInfoText}>
            Current cart items: {getItemCount()}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearCart}
        >
          <MaterialIcons name="clear" size={20} color={theme.COLORS.primary} />
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  header: {
    backgroundColor: theme.COLORS.accent,
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.COLORS.primary,
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  cartInfoContainer: {
    backgroundColor: theme.COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartInfoText: {
    fontSize: 16,
    color: theme.COLORS.text,
    marginLeft: 10,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: theme.COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  clearButtonText: {
    color: theme.COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});