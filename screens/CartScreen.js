import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { useCart } from '../App';

const CartScreen = ({ navigation }) => {
  const { state, dispatch } = useCart();
  const [tipAmount, setTipAmount] = useState('');
  const [isTipApplied, setIsTipApplied] = useState(false);

  const foodTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const taxAmount = foodTotal * 0.03; // 3% tax
  const deliveryFee = 2.00;
  const tip = isTipApplied ? (parseFloat(tipAmount) || 0) : 0;
  const grandTotal = foodTotal + taxAmount + deliveryFee + tip;

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const handleApplyTip = () => {
    const parsedTip = parseFloat(tipAmount) || 0;
    if (parsedTip < 0) {
      Alert.alert('Invalid Tip', 'Please enter a valid tip amount');
      return;
    }
    dispatch({ type: 'SET_TIP', payload: parsedTip });
    setIsTipApplied(true);
    Alert.alert('Tip Applied', `$${parsedTip.toFixed(2)} tip has been added to your order`);
  };

  const handlePlaceOrder = () => {
    if (state.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order');
      return;
    }
    navigation.navigate('DeliveryAddress');
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={[styles.itemImage, { backgroundColor: item.imageColor }]}>
        <Text style={styles.imageText}>{item.imageText}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cookingRequests}>🍳 Cooking requests</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
      <TouchableOpacity style={styles.favoriteButton}>
        <Text style={styles.heartIcon}>🤍</Text>
      </TouchableOpacity>
    </View>
  );

  if (state.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.backToMenuButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.backToMenuText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={state.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
      
      <TouchableOpacity style={styles.addMoreButton}>
        <Text style={styles.addMoreText}>Add More Items</Text>
      </TouchableOpacity>

      <View style={styles.couponSection}>
        <TextInput
          style={styles.couponInput}
          placeholder="Enter coupon code"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.billSummary}>
        <Text style={styles.billTitle}>Bill Summary</Text>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Food Total</Text>
          <Text style={styles.billValue}>${foodTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>GST/Taxes (3%)</Text>
          <Text style={styles.billValue}>${taxAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          <Text style={styles.billValue}>${deliveryFee.toFixed(2)}</Text>
        </View>
        {isTipApplied && (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tip</Text>
            <Text style={styles.billValue}>${tip.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.billRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.tipSection}>
        <Text style={styles.tipLabel}>Add a Tip</Text>
        <View style={styles.tipInputRow}>
          <TextInput
            style={styles.tipInput}
            placeholder="Enter tip amount"
            placeholderTextColor="#999"
            value={tipAmount}
            onChangeText={setTipAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.tipCheckButton}
            onPress={handleApplyTip}
          >
            <Text style={styles.checkIcon}>✓</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.placeOrderButton}
        onPress={handlePlaceOrder}
      >
        <Text style={styles.placeOrderText}>Place Order</Text>
      </TouchableOpacity>
    </ScrollView>
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
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    color: '#333',
  },
  cookingRequests: {
    fontSize: 12,
    color: '#888',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 16,
  },
  favoriteButton: {
    padding: 8,
  },
  heartIcon: {
    fontSize: 20,
  },
  addMoreButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  couponSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  applyButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  billSummary: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tipSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  tipLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  tipCheckButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeOrderButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  backToMenuButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToMenuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;