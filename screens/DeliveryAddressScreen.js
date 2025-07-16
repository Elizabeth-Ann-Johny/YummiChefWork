import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { useCart } from '../App';

const DeliveryAddressScreen = ({ navigation }) => {
  const { state, dispatch } = useCart();
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    instructions: ''
  });

  const foodTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const taxAmount = foodTotal * 0.03;
  const deliveryFee = 2.00;
  const tip = state.tip || 0;
  const grandTotal = foodTotal + taxAmount + deliveryFee + tip;

  const handleConfirmOrder = () => {
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Order Confirmed!',
      `Your order has been placed successfully!\n\nTotal: $${grandTotal.toFixed(2)}\n\nEstimated delivery time: 30-45 minutes`,
      [
        {
          text: 'OK',
          onPress: () => {
            dispatch({ type: 'CLEAR_CART' });
            navigation.navigate('Menu');
          }
        }
      ]
    );
  };

  const updateAddress = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Delivery Address</Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street Address *</Text>
          <TextInput
            style={styles.input}
            value={address.street}
            onChangeText={(text) => updateAddress('street', text)}
            placeholder="123 Main Street"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={address.city}
              onChangeText={(text) => updateAddress('city', text)}
              placeholder="New York"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={address.state}
              onChangeText={(text) => updateAddress('state', text)}
              placeholder="NY"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ZIP Code *</Text>
          <TextInput
            style={styles.input}
            value={address.zipCode}
            onChangeText={(text) => updateAddress('zipCode', text)}
            placeholder="10001"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={address.phone}
            onChangeText={(text) => updateAddress('phone', text)}
            placeholder="(555) 123-4567"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address.instructions}
            onChangeText={(text) => updateAddress('instructions', text)}
            placeholder="Leave at door, ring bell, etc."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({state.items.length})</Text>
          <Text style={styles.summaryValue}>${foodTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (3%)</Text>
          <Text style={styles.summaryValue}>${taxAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
        </View>
        {tip > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tip</Text>
            <Text style={styles.summaryValue}>${tip.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmOrder}
      >
        <Text style={styles.confirmButtonText}>Confirm Order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  orderSummary: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
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
  confirmButton: {
    backgroundColor: '#FF6B35',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6B35',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  backButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DeliveryAddressScreen;