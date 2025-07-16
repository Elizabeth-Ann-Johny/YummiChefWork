import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

export default function Home() {
  const { addToCart } = useCart();

  const sampleDish = {
    id: '1',
    name: 'Sample Dish',
    description: 'A delicious sample dish for testing',
    price: 250,
    image: 'https://via.placeholder.com/150',
    cookingTime: 30,
    rating: 4.5,
  };

  const handleAddToCart = async () => {
    await addToCart(sampleDish);
    alert('Item added to cart!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ Food App</Text>
        <Text style={styles.headerSubtitle}>Delicious food delivered to you</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Home</Text>
        <Text style={styles.subtitle}>
          This is a placeholder home screen. You can add your restaurant listings, 
          food categories, and other features here.
        </Text>
        
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Demo: Add Sample Item to Cart</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addButtonText}>Add Sample Dish to Cart</Text>
          </TouchableOpacity>
        </View>
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
  demoContainer: {
    backgroundColor: theme.COLORS.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: theme.COLORS.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: theme.COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});