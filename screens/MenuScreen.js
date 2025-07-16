import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useCart } from '../App';

const MenuScreen = ({ navigation }) => {
  const { dispatch } = useCart();

  const menuItems = [
    {
      id: 1,
      name: 'Margherita',
      price: 10.00,
      imageColor: '#FF6B35',
      imageText: '🍕',
      description: 'Classic pizza with tomato sauce, mozzarella, and basil',
      cookingRequests: true
    },
    {
      id: 2,
      name: 'Grilled Salmon',
      price: 12.00,
      imageColor: '#FF8C42',
      imageText: '🐟',
      description: 'Fresh grilled salmon with seasonal vegetables',
      cookingRequests: true
    },
    {
      id: 3,
      name: 'Caesar Salad',
      price: 8.00,
      imageColor: '#6AB04C',
      imageText: '🥗',
      description: 'Crisp romaine lettuce with parmesan and croutons',
      cookingRequests: true
    },
    {
      id: 4,
      name: 'Chicken Pasta',
      price: 14.00,
      imageColor: '#F39C12',
      imageText: '🍝',
      description: 'Creamy pasta with grilled chicken and herbs',
      cookingRequests: true
    },
    {
      id: 5,
      name: 'Beef Burger',
      price: 13.00,
      imageColor: '#8B4513',
      imageText: '🍔',
      description: 'Juicy beef patty with lettuce, tomato, and cheese',
      cookingRequests: true
    }
  ];

  const handleAddToCart = (item) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
    Alert.alert(
      'Added to Cart',
      `${item.name} has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View style={[styles.itemImage, { backgroundColor: item.imageColor }]}>
        <Text style={styles.imageText}>{item.imageText}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        {item.cookingRequests && (
          <Text style={styles.cookingRequests}>🍳 Cooking requests</Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={styles.viewCartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <Text style={styles.viewCartText}>View Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cookingRequests: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewCartButton: {
    backgroundColor: '#FF6B35',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MenuScreen;