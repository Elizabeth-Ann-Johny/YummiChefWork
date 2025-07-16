import { MaterialIcons } from '@expo/vector-icons';
import { router, Link } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useCart } from '../../contexts/CartContext';
import { theme } from '../../lib/theme';

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getFoodCost,
    getTaxAmount,
    getTipAmount,
    setTipAmount,
    getTotalAmount,
    getItemCount
  } = useCart();

  const [tipInput, setTipInput] = useState('');
  const [isTipConfirmed, setIsTipConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddTip = () => {
    const tipValue = parseFloat(tipInput);
    if (isNaN(tipValue) || tipValue < 0) {
      Alert.alert('Invalid Tip', 'Please enter a valid tip amount');
      return;
    }
    setTipAmount(tipValue);
    setIsTipConfirmed(true);
    Alert.alert('Tip Added', `₹${tipValue} tip has been added to your order`);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before placing an order');
      return;
    }

    setLoading(true);
    // Simulate order processing
    setTimeout(() => {
      setLoading(false);
      // Navigate to delivery address screen
      router.push('/delivery-address/index' as any);
    }, 1000);
  };

  const CartItemCard = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          <View style={styles.ratingContainer}>
            <Text style={{ color: '#FFD700', fontSize: 14 }}>★</Text>
            <Text style={{ color: theme.COLORS.text, fontSize: 12 }}>{item.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <MaterialIcons name="remove" size={20} color={theme.COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <MaterialIcons name="add" size={20} color={theme.COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptyMessage}>
          Add some delicious dishes to your cart and they'll appear here!
        </Text>
        <Link href="/(tabs)/home/index" asChild>
          <TouchableOpacity style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  const foodCost = getFoodCost();
  const taxAmount = getTaxAmount();
  const tipAmount = getTipAmount();
  const totalAmount = getTotalAmount();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 My Cart</Text>
        <Text style={styles.headerSubtitle}>
          {getItemCount()} item{getItemCount() === 1 ? '' : 's'}
        </Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CartItemCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        {/* Bill Summary */}
        <View style={styles.billSummary}>
          <Text style={styles.billTitle}>Bill Summary</Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Food Cost:</Text>
            <Text style={styles.billValue}>₹{foodCost.toFixed(2)}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax (3%):</Text>
            <Text style={styles.billValue}>₹{taxAmount.toFixed(2)}</Text>
          </View>
          
          {tipAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Tip:</Text>
              <Text style={styles.billValue}>₹{tipAmount.toFixed(2)}</Text>
            </View>
          )}
          
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Add Tip Section */}
        <View style={styles.tipSection}>
          <Text style={styles.tipLabel}>Add a Tip</Text>
          <View style={styles.tipInputContainer}>
            <TextInput
              style={styles.tipInput}
              placeholder="Enter tip amount"
              value={tipInput}
              onChangeText={setTipInput}
              keyboardType="numeric"
              editable={!isTipConfirmed}
            />
            <TouchableOpacity 
              style={[
                styles.tipButton,
                isTipConfirmed && styles.tipButtonConfirmed
              ]}
              onPress={handleAddTip}
              disabled={isTipConfirmed}
            >
              <MaterialIcons 
                name={isTipConfirmed ? "check" : "check"} 
                size={20} 
                color={isTipConfirmed ? "#4CAF50" : theme.COLORS.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.COLORS.primary} />
          ) : (
            <Text style={styles.checkoutText}>Place Order</Text>
          )}
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
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  cartItem: {
    backgroundColor: theme.COLORS.white,
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.COLORS.text,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    lineHeight: 16,
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.COLORS.accent,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  quantityButton: {
    backgroundColor: theme.COLORS.gray,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginVertical: 5,
  },
  footer: {
    backgroundColor: theme.COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.border,
  },
  billSummary: {
    marginBottom: 20,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: 15,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
    color: theme.COLORS.text,
  },
  billValue: {
    fontSize: 14,
    color: theme.COLORS.text,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.border,
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.COLORS.accent,
  },
  tipSection: {
    marginBottom: 20,
  },
  tipLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginBottom: 10,
  },
  tipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  tipButton: {
    backgroundColor: theme.COLORS.gray,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipButtonConfirmed: {
    backgroundColor: '#E8F5E8',
  },
  checkoutButton: {
    backgroundColor: theme.COLORS.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  checkoutText: {
    color: theme.COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.background,
    padding: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: theme.COLORS.accent,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  shopButtonText: {
    color: theme.COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});