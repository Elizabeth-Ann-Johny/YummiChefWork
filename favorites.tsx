import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  userName: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

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
        const dish = Array.isArray(fav.dishes) ? fav.dishes[0] : fav.dishes;
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

  const openDishDetails = async (dish: Dish) => {
    setSelectedDish(dish);
    setDetailsModalVisible(true);
    
    // Fetch reviews for this specific dish
    await fetchDishReviews(dish.id);
  };

  const closeDishDetails = () => {
    setDetailsModalVisible(false);
    setSelectedDish(null);
  };

  const fetchDishReviews = async (dishId: string) => {
    setLoadingReviews(true);
    try {
      // Try with foreign key relationship first
      let { data: reviewsData, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          USERS!inner (
            name
          )
        `)
        .eq('dish_id', dishId)
        .order('created_at', { ascending: false });

      // If foreign key relationship doesn't work, try manual join
      if (error && error.code === 'PGRST200') {
        console.log('Foreign key relationship not found, trying manual join...');
        
        // First get reviews
        const { data: reviewsOnly, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('dish_id', dishId)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
          return;
        }

        // Get unique user IDs
        const userIds = [...new Set(reviewsOnly?.map(r => r.user_id) || [])];
        
        // Get user names
        const { data: usersData, error: usersError } = await supabase
          .from('USERS')
          .select('id, name')
          .in('id', userIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          return;
        }

        // Combine the data
        reviewsData = reviewsOnly?.map(review => ({
          ...review,
          USERS: usersData?.filter(user => user.id === review.user_id) || []
        })) || [];
      } else if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      const formattedReviews: Review[] = (reviewsData || []).map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        userName: review.USERS?.[0]?.name || 'Anonymous',
      }));

      // Update the selected dish with the fetched reviews
      setSelectedDish(prev => prev ? { ...prev, reviews: formattedReviews } : null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const getSpiceEmojis = (level: number = 0): string => {
    return '🌶️'.repeat(Math.min(level, 5));
  };

  const FavoriteCard = ({ item }: { item: Dish }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openDishDetails(item)}
    >
      {/* Image Container with Overlays */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        
        {/* Heart Button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            removeFavorite(item.id);
          }}
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
    </TouchableOpacity>
  );

  const DishDetailsModal = () => {
    if (!selectedDish) return null;

    const addToCart = () => {
      Alert.alert('Added to Cart', `${selectedDish.name} has been added to your cart!`);
      closeDishDetails();
    };

    return (
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeDishDetails}
      >
        <View style={styles.detailsModalOverlay}>
          <View style={styles.detailsModalContainer}>
            <ScrollView style={styles.detailsModalContent} showsVerticalScrollIndicator={false}>
              {/* Close Button */}
              <TouchableOpacity onPress={closeDishDetails} style={styles.detailsCloseButton}>
                <MaterialIcons name="close" size={24} color={theme.COLORS.text} />
              </TouchableOpacity>

              {/* Dish Image */}
              <Image source={{ uri: selectedDish.image }} style={styles.detailsModalImage} />

              {/* Content */}
              <View style={styles.detailsModalContentPadding}>
                {/* Title Section */}
                <View style={styles.detailsTitleSection}>
                  <Text style={styles.detailsModalDishName}>{selectedDish.name}</Text>
                  <View style={styles.detailsModalPriceTag}>
                    <Text style={styles.detailsModalPriceText}>₹{selectedDish.price}</Text>
                  </View>
                </View>

                {/* Tags */}
                <View style={styles.detailsModalTagsContainer}>
                  <View style={styles.detailsModalServiceTag}>
                    <Text style={styles.detailsModalServiceTagText}>
                      {selectedDish.serviceType === 'chef-at-home' ? '👨‍🍳 Chef at Home' : '🏠 Home Delivery'}
                    </Text>
                  </View>
                  <View style={[
                    styles.detailsModalDietaryTag,
                    { backgroundColor: selectedDish.dietaryType === 'vegetarian' ? '#4CAF50' : '#F44336' }
                  ]}>
                    <Text style={styles.detailsModalDietaryTagText}>
                      {selectedDish.dietaryType === 'vegetarian' ? 'Vegetarian' : 'Non-Vegetarian'}
                    </Text>
                  </View>
                </View>

                {/* Meta Info */}
                <View style={styles.detailsModalMetaContainer}>
                  <View style={styles.detailsModalMetaItem}>
                    <MaterialIcons name="star" size={20} color="#FFD700" />
                    <Text style={styles.detailsModalMetaText}>{selectedDish.rating}</Text>
                  </View>
                  <View style={styles.detailsModalMetaItem}>
                    <MaterialIcons name="access-time" size={20} color="#666" />
                    <Text style={styles.detailsModalMetaText}>{selectedDish.cookingTime} min</Text>
                  </View>
                  <View style={styles.detailsModalMetaItem}>
                    <Text style={styles.detailsModalCuisineText}>{selectedDish.cuisine?.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Spice Level */}
                {selectedDish.spiceLevel && (
                  <View style={styles.detailsModalSection}>
                    <Text style={styles.detailsModalSectionTitle}>Spice Level</Text>
                    <Text style={styles.detailsModalSpiceText}>{getSpiceEmojis(selectedDish.spiceLevel)}</Text>
                  </View>
                )}

                {/* Description */}
                <View style={styles.detailsModalSection}>
                  <Text style={styles.detailsModalSectionTitle}>Description</Text>
                  <Text style={styles.detailsModalDescription}>{selectedDish.description}</Text>
                </View>

                {/* Ingredients */}
                {selectedDish.ingredients && (
                  <View style={styles.detailsModalSection}>
                    <Text style={styles.detailsModalSectionTitle}>Ingredients</Text>
                    <View style={styles.detailsModalIngredientsContainer}>
                      {selectedDish.ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.detailsModalIngredientTag}>
                          <Text style={styles.detailsModalIngredientText}>{ingredient}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Allergens */}
                {selectedDish.allergens && (
                  <View style={styles.detailsModalSection}>
                    <Text style={styles.detailsModalSectionTitle}>Allergens</Text>
                    <Text style={styles.detailsModalDescription}>{selectedDish.allergens}</Text>
                  </View>
                )}

                {/* Reviews */}
                <View style={styles.detailsModalSection}>
                  <Text style={styles.detailsModalSectionTitle}>
                    Reviews {loadingReviews && '(Loading...)'}
                  </Text>
                  
                  {selectedDish.reviews && selectedDish.reviews.length > 0 ? (
                    selectedDish.reviews.map((review) => (
                      <View key={review.id} style={styles.detailsModalReviewContainer}>
                        <View style={styles.detailsModalReviewHeader}>
                          <Text style={styles.detailsModalReviewerName}>{review.userName}</Text>
                          <View style={styles.detailsModalReviewRating}>
                            <MaterialIcons name="star" size={14} color="#FFD700" />
                            <Text style={styles.detailsModalReviewRatingText}>{review.rating}</Text>
                          </View>
                        </View>
                        <Text style={styles.detailsModalReviewComment}>{review.comment}</Text>
                        <Text style={styles.detailsModalReviewDate}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.detailsModalNoReviews}>No reviews yet</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Action Button */}
            <View style={styles.detailsModalBottomActions}>
              <TouchableOpacity style={styles.detailsModalAddToCartButton} onPress={addToCart}>
                <Text style={styles.detailsModalAddToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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

      <DishDetailsModal />
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
    flex: 1,
    margin: 5,
    height: 300,
    position: 'relative',
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
  detailsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailsModalContainer: {
    backgroundColor: theme.COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  detailsModalContent: {
    flex: 1,
  },
  detailsCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  detailsModalImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  detailsModalContentPadding: {
    padding: 20,
  },
  detailsTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailsModalDishName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    flex: 1,
  },
  detailsModalPriceTag: {
    backgroundColor: theme.COLORS.accent,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsModalPriceText: {
    color: theme.COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  detailsModalTagsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailsModalServiceTag: {
    backgroundColor: theme.COLORS.gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  detailsModalServiceTagText: {
    fontSize: 12,
    color: theme.COLORS.text,
    fontWeight: '600',
  },
  detailsModalDietaryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailsModalDietaryTagText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  detailsModalMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsModalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailsModalMetaText: {
    fontSize: 14,
    color: theme.COLORS.text,
    marginLeft: 4,
  },
  detailsModalCuisineText: {
    fontSize: 12,
    color: theme.COLORS.accent,
    fontWeight: '600',
  },
  detailsModalSection: {
    marginBottom: 20,
  },
  detailsModalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: 10,
  },
  detailsModalSpiceText: {
    fontSize: 18,
  },
  detailsModalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsModalIngredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailsModalIngredientTag: {
    backgroundColor: theme.COLORS.gray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  detailsModalIngredientText: {
    fontSize: 12,
    color: theme.COLORS.text,
  },
  detailsModalReviewContainer: {
    backgroundColor: theme.COLORS.gray,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  detailsModalReviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsModalReviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.COLORS.text,
  },
  detailsModalReviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsModalReviewRatingText: {
    fontSize: 12,
    color: theme.COLORS.text,
    marginLeft: 2,
  },
  detailsModalReviewComment: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailsModalReviewDate: {
    fontSize: 12,
    color: '#999',
  },
  detailsModalNoReviews: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  detailsModalBottomActions: {
    padding: 20,
    backgroundColor: theme.COLORS.white,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.border,
  },
  detailsModalAddToCartButton: {
    backgroundColor: theme.COLORS.accent,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailsModalAddToCartText: {
    color: theme.COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});