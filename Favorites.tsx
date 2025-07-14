import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../lib/theme';

type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  cookingTime: number;
  rating: number;
  spiceLevel?: number;
  serviceType?: string;
  cuisine?: string;
  ingredients?: string[];
  dietaryType?: string;
  allergens?: string;
  isFavorite?: boolean;
};

export default function Favorites() {
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setLoading(false);
        return;
      }

      setUser(userData.user);

      // Fetch user's favorites with dish details
      const { data: favoritesData, error } = await supabase
        .from('favorites')
        .select(`
          dish_id,
          dishes (
            id,
            name,
            description,
            price,
            image,
            cooking_time,
            rating,
            spice_level,
            service_type,
            cuisine,
            ingredients,
            dietary_type,
            alergens
          )
        `)
        .eq('user_id', userData.user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        Alert.alert('Error', 'Failed to load favorites');
        setLoading(false);
        return;
      }

      // Transform the data to match our Dish type
      const dishesWithFavorites: Dish[] = favoritesData?.map(fav => {
        const dish = fav.dishes;
        if (!dish) return null;
        
        return {
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: Number(dish.price),
          image: dish.image,
          cookingTime: Number(dish.cooking_time),
          rating: Number(dish.rating),
          spiceLevel: dish.spice_level ? Number(dish.spice_level) : 0,
          serviceType: dish.service_type || 'home-delivery',
          cuisine: dish.cuisine || 'unknown',
          ingredients: dish.ingredients || [],
          dietaryType: dish.dietary_type || 'vegetarian',
          allergens: dish.alergens || '',
          isFavorite: true,
        };
      }).filter(dish => dish !== null) || [];

      setFavorites(dishesWithFavorites);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'Something went wrong');
      setLoading(false);
    }
  };

  const removeFavorite = async (dishId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('dish_id', dishId);

      if (error) {
        console.error('Error removing favorite:', error);
        Alert.alert('Error', 'Failed to remove favorite');
        return;
      }

      // Update local state
      setFavorites(prev => prev.filter(dish => dish.id !== dishId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const getSpiceEmojis = (level: number = 0): string => {
    return '🌶️'.repeat(Math.min(level, 5));
  };

  const FavoriteCard = ({ item }: { item: Dish }) => (
    <View style={styles.card}>
      {/* Image Container with Overlays */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        
        {/* Heart Button */}
        <TouchableOpacity
          onPress={() => removeFavorite(item.id)}
          style={styles.heartButton}
        >
          <Text style={styles.heartIcon}>❤️</Text>
        </TouchableOpacity>

        {/* Price Tag */}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>₹{item.price}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
        
        {/* Service Type and Rating Row */}
        <View style={styles.serviceRatingRow}>
          <View style={styles.serviceTag}>
            <Text style={styles.serviceTagText}>
              {item.serviceType === 'chef-at-home' ? 'Chef at Home' : 'Home Delivery'}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* Dietary Type and Cooking Time Row */}
        <View style={styles.dietaryTimeRow}>
          <View style={[
            styles.dietaryTag,
            { backgroundColor: item.dietaryType === 'vegetarian' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.dietaryTagText}>
              {item.dietaryType === 'vegetarian' ? 'vegetarian' : 'non-vegetarian'}
            </Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.clockIcon}>⏱️</Text>
            <Text style={styles.timeText}>{item.cookingTime} min</Text>
          </View>
        </View>

        {/* Cuisine */}
        <Text style={styles.cuisineText}>
          {item.cuisine?.toUpperCase() || 'CUISINE'}
        </Text>

        {/* Spice Level */}
        {!!item.spiceLevel && (
          <Text style={styles.spiceLevel}>{getSpiceEmojis(item.spiceLevel)}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.accent} />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔒</Text>
        <Text style={styles.emptyTitle}>Please Log In</Text>
        <Text style={styles.emptyMessage}>Log in to view your favorite dishes</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💔</Text>
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptyMessage}>
          Start exploring dishes and tap the heart icon to add them to your favorites!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ My Favorites</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} favorite dish{favorites.length === 1 ? '' : 'es'}
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <FavoriteCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchFavorites}
      />
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
  },
  card: {
    backgroundColor: theme.COLORS.white,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  heartIcon: {
    fontSize: 16,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 1,
  },
  priceText: {
    fontSize: 12,
    color: theme.COLORS.primary,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 15,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: 8,
  },
  serviceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  serviceTagText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: theme.COLORS.text,
    fontWeight: '600',
  },
  dietaryTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dietaryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dietaryTagText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: theme.COLORS.text,
    fontWeight: '600',
  },
  cuisineText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  spiceLevel: {
    fontSize: 12,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: theme.COLORS.text,
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
  },
});