import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useCart } from '../contexts/CartContext';
import { theme } from '../lib/theme';

export default function DeliveryAddress() {
  const { getTotalAmount, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['fullName', 'phoneNumber', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!addressForm[field as keyof typeof addressForm].trim()) {
        Alert.alert('Missing Information', `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    if (addressForm.phoneNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return false;
    }
    
    if (addressForm.pincode.length !== 6) {
      Alert.alert('Invalid PIN Code', 'Please enter a valid 6-digit PIN code');
      return false;
    }
    
    return true;
  };

  const handleConfirmOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Order Confirmed! 🎉',
        `Your order has been confirmed and will be delivered to:\n${addressForm.address}, ${addressForm.city}\n\nTotal: ₹${getTotalAmount().toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              router.push('/(tabs)/home/');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Address</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Information</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={addressForm.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={addressForm.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={addressForm.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="House/Flat No., Street, Area"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={addressForm.city}
                onChangeText={(value) => handleInputChange('city', value)}
                placeholder="City"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={styles.input}
                value={addressForm.state}
                onChangeText={(value) => handleInputChange('state', value)}
                placeholder="State"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>PIN Code *</Text>
              <TextInput
                style={styles.input}
                value={addressForm.pincode}
                onChangeText={(value) => handleInputChange('pincode', value)}
                placeholder="PIN Code"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Landmark</Text>
              <TextInput
                style={styles.input}
                value={addressForm.landmark}
                onChangeText={(value) => handleInputChange('landmark', value)}
                placeholder="Landmark (optional)"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Order Summary</Text>
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>₹{getTotalAmount().toFixed(2)}</Text>
            </View>
            <Text style={styles.summaryNote}>
              (Includes food cost, taxes, and tips)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚚 Delivery Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="schedule" size={20} color={theme.COLORS.accent} />
              <Text style={styles.infoText}>Estimated delivery: 30-45 minutes</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="payment" size={20} color={theme.COLORS.accent} />
              <Text style={styles.infoText}>Payment: Cash on Delivery</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color={theme.COLORS.accent} />
              <Text style={styles.infoText}>Delivery partner will call you</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.COLORS.primary} />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.COLORS.primary,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.COLORS.text,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.COLORS.white,
    color: theme.COLORS.text,
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
    backgroundColor: theme.COLORS.white,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.text,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.accent,
  },
  summaryNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: theme.COLORS.white,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: theme.COLORS.text,
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.COLORS.white,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.border,
  },
  confirmButton: {
    backgroundColor: theme.COLORS.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: theme.COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});