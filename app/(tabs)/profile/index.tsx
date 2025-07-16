import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import { theme } from '../../../lib/theme';

export default function Profile() {
  const { clearCart, getItemCount } = useCart();
  const { user, profile, signOut } = useAuth();

  const handleClearCart = async () => {
    await clearCart();
    alert('Cart cleared!');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        
        <View style={styles.userInfoContainer}>
          <MaterialIcons name="person" size={24} color={theme.COLORS.accent} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        
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
        
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <MaterialIcons name="logout" size={20} color={theme.COLORS.accent} />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  userInfoContainer: {
    backgroundColor: theme.COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
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
  signOutButton: {
    backgroundColor: theme.COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.COLORS.accent,
  },
  signOutButtonText: {
    color: theme.COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});