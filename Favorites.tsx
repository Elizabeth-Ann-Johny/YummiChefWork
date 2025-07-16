import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from './lib/supabase';
import { theme } from './lib/theme';
import { sharedStyles, favoritesStyles } from './sharedStyles';

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
  chef?: {
    name: string;
    average_rating: number;
  };
  reviews?: Review[];
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

  // Helper function to safely extract chef name from nested structure
  const getChefName = (chefs: any): string | undefined => {
    if (!chefs) return undefined;
    
    // Handle array of chefs
    if (Array.isArray(chefs) && chefs[0]) {
      const chef = chefs[0];
      if (chef.USERS) {
        return Array.isArray(chef.USERS) ? chef.USERS[0]?.name : chef.USERS?.name;
      }
    }
    
    // Handle single chef object
    if (chefs.USERS) {
      return Array.isArray(chefs.USERS) ? chefs.USERS[0]?.name : chefs.USERS?.name;
    }
    
    return undefined;
  };

  // Helper function to safely extract chef rating
  const getChefRating = (chefs: any): number => {
    if (!chefs) return 0;
    
    // Handle array of chefs
    if (Array.isArray(chefs) && chefs[0]) {
      return chefs[0].average_rating ?? 0;
    }
    
    // Handle single chef object
    return chefs.average_rating ?? 0;
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

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
            alergens,
            chef_id,
            CHEFS (
              average_rating,
              USERS (
                name
              )
            )
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
          chef: dish.CHEFS && getChefName(dish.CHEFS)
            ? {
                name: getChefName(dish.CHEFS)!,
                average_rating: getChefRating(dish.CHEFS),
              }
            : undefined,
          reviews: [],
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

      // Update local state - remove from favorites list
      setFavorites(prev => prev.filter(dish => dish.id !== dishId));
      
      // If the dish details modal is open for this dish, close it
      if (selectedDish && selectedDish.id === dishId) {
        closeDishDetails();
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const getSpiceEmojis = (level: number = 0): string => {
    return '🌶️'.repeat(Math.min(level, 5));
  };

  const FavoriteCard = ({ item }: { item: Dish }) => (
    <TouchableOpacity
      style={sharedStyles.card}
      onPress={() => openDishDetails(item)}
    >
      {/* Image Container with Overlays */}
      <View style={sharedStyles.imageContainer}>
        <Image source={{ uri: item.image }} style={sharedStyles.image} />
        
        {/* Heart Button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); // Prevent triggering dish details
            removeFavorite(item.id);
          }}
          style={sharedStyles.heartButton}
        >
          <Text style={sharedStyles.heartIcon}>❤️</Text>
        </TouchableOpacity>

        {/* Price Tag */}
        <View style={sharedStyles.priceTag}>
          <Text style={sharedStyles.priceText}>₹{item.price}</Text>
        </View>
      </View>

      <View style={sharedStyles.cardContent}>
        <Text style={sharedStyles.dishName} numberOfLines={1}>{item.name}</Text>
        
        {/* Service Type and Rating Row */}
        <View style={sharedStyles.serviceRatingRow}>
          <View style={sharedStyles.serviceTag}>
            <Text style={sharedStyles.serviceTagText}>
              {item.serviceType === 'chef-at-home' ? 'Chef at Home' : 'Home Delivery'}
            </Text>
          </View>
          <View style={sharedStyles.ratingContainer}>
            <Text style={sharedStyles.starIcon}>⭐</Text>
            <Text style={sharedStyles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        {/* Dietary Type and Cooking Time Row */}
        <View style={sharedStyles.dietaryTimeRow}>
          <View style={[
            sharedStyles.dietaryTag,
            { backgroundColor: item.dietaryType === 'vegetarian' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={sharedStyles.dietaryTagText}>
              {item.dietaryType === 'vegetarian' ? 'vegetarian' : 'non-vegetarian'}
            </Text>
          </View>
          <View style={sharedStyles.timeContainer}>
            <Text style={sharedStyles.clockIcon}>⏱️</Text>
            <Text style={sharedStyles.timeText}>{item.cookingTime} min</Text>
          </View>
        </View>

        {/* Cuisine */}
        <Text style={sharedStyles.cuisineText}>
          {item.cuisine?.toUpperCase() || 'CUISINE'}
        </Text>

        {/* Spice Level */}
        {!!item.spiceLevel && (
          <Text style={sharedStyles.spiceLevel}>{getSpiceEmojis(item.spiceLevel)}</Text>
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
        <View style={sharedStyles.detailsModalOverlay}>
          <View style={sharedStyles.detailsModalContainer}>
            <ScrollView style={sharedStyles.detailsModalContent} showsVerticalScrollIndicator={false}>
              {/* Close Button */}
              <TouchableOpacity onPress={closeDishDetails} style={sharedStyles.detailsCloseButton}>
                <MaterialIcons name="close" size={24} color={theme.COLORS.text} />
              </TouchableOpacity>

              {/* Dish Image */}
              <Image source={{ uri: selectedDish.image }} style={sharedStyles.detailsModalImage} />

              {/* Content */}
              <View style={sharedStyles.detailsModalContentPadding}>
                {/* Title Section */}
                <View style={sharedStyles.detailsTitleSection}>
                  <Text style={sharedStyles.detailsModalDishName}>{selectedDish.name}</Text>
                  <View style={sharedStyles.detailsModalPriceTag}>
                    <Text style={sharedStyles.detailsModalPriceText}>₹{selectedDish.price}</Text>
                  </View>
                </View>

                {/* Tags */}
                <View style={sharedStyles.detailsModalTagsContainer}>
                  <View style={sharedStyles.detailsModalServiceTag}>
                    <Text style={sharedStyles.detailsModalServiceTagText}>
                      {selectedDish.serviceType === 'chef-at-home' ? '👨‍🍳 Chef at Home' : '🏠 Home Delivery'}
                    </Text>
                  </View>
                  <View style={[
                    sharedStyles.detailsModalDietaryTag,
                    { backgroundColor: selectedDish.dietaryType === 'vegetarian' ? '#4CAF50' : '#F44336' }
                  ]}>
                    <Text style={sharedStyles.detailsModalDietaryTagText}>
                      {selectedDish.dietaryType === 'vegetarian' ? 'Vegetarian' : 'Non-Vegetarian'}
                    </Text>
                  </View>
                </View>

                {/* Meta Info */}
                <View style={sharedStyles.detailsModalMetaContainer}>
                  <View style={sharedStyles.detailsModalMetaItem}>
                    <MaterialIcons name="star" size={20} color="#FFD700" />
                    <Text style={sharedStyles.detailsModalMetaText}>{selectedDish.rating}</Text>
                  </View>
                  <View style={sharedStyles.detailsModalMetaItem}>
                    <MaterialIcons name="access-time" size={20} color="#666" />
                    <Text style={sharedStyles.detailsModalMetaText}>{selectedDish.cookingTime} min</Text>
                  </View>
                  <View style={sharedStyles.detailsModalMetaItem}>
                    <Text style={sharedStyles.detailsModalCuisineText}>{selectedDish.cuisine?.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Spice Level */}
                {selectedDish.spiceLevel && (
                  <View style={sharedStyles.detailsModalSection}>
                    <Text style={sharedStyles.detailsModalSectionTitle}>Spice Level</Text>
                    <Text style={sharedStyles.detailsModalSpiceText}>{getSpiceEmojis(selectedDish.spiceLevel)}</Text>
                  </View>
                )}

                {/* Description */}
                <View style={sharedStyles.detailsModalSection}>
                  <Text style={sharedStyles.detailsModalSectionTitle}>Description</Text>
                  <Text style={sharedStyles.detailsModalDescription}>{selectedDish.description}</Text>
                </View>

                {/* Ingredients */}
                {selectedDish.ingredients && (
                  <View style={sharedStyles.detailsModalSection}>
                    <Text style={sharedStyles.detailsModalSectionTitle}>Ingredients</Text>
                    <View style={sharedStyles.detailsModalIngredientsContainer}>
                      {selectedDish.ingredients.map((ingredient, index) => (
                        <View key={index} style={sharedStyles.detailsModalIngredientTag}>
                          <Text style={sharedStyles.detailsModalIngredientText}>{ingredient}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Chef Info */}
                <View style={sharedStyles.detailsModalSection}>
                  <Text style={sharedStyles.detailsModalSectionTitle}>Chef</Text>
                  <View style={sharedStyles.detailsModalChefContainer}>
                    <View style={sharedStyles.detailsModalChefInfo}>
                      <Text style={sharedStyles.detailsModalChefName}>
                        Chef {selectedDish.chef?.name ?? 'Unknown'}
                      </Text>
                      <Text style={sharedStyles.detailsModalChefRatingText}>
                        Rating: {selectedDish.chef?.average_rating ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Reviews */}
                <View style={sharedStyles.detailsModalSection}>
                  <Text style={sharedStyles.detailsModalSectionTitle}>
                    Reviews {loadingReviews && '(Loading...)'}
                  </Text>
                  
                  {selectedDish.reviews && selectedDish.reviews.length > 0 ? (
                    selectedDish.reviews.map((review) => (
                      <View key={review.id} style={sharedStyles.detailsModalReviewContainer}>
                        <View style={sharedStyles.detailsModalReviewHeader}>
                          <Text style={sharedStyles.detailsModalReviewerName}>{review.userName}</Text>
                          <View style={sharedStyles.detailsModalReviewRating}>
                            <MaterialIcons name="star" size={14} color="#FFD700" />
                            <Text style={sharedStyles.detailsModalReviewRatingText}>{review.rating}</Text>
                          </View>
                        </View>
                        <Text style={sharedStyles.detailsModalReviewComment}>{review.comment}</Text>
                        <Text style={sharedStyles.detailsModalReviewDate}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={sharedStyles.detailsModalNoReviews}>No reviews yet</Text>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Bottom Action Button */}
            <View style={sharedStyles.detailsModalBottomActions}>
              <TouchableOpacity style={sharedStyles.detailsModalAddToCartButton} onPress={addToCart}>
                <Text style={sharedStyles.detailsModalAddToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={sharedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.COLORS.accent} />
        <Text style={sharedStyles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={sharedStyles.emptyContainer}>
        <Text style={sharedStyles.emptyIcon}>🔒</Text>
        <Text style={sharedStyles.emptyTitle}>Please Log In</Text>
        <Text style={sharedStyles.emptyMessage}>Log in to view your favorite dishes</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={sharedStyles.emptyContainer}>
        <Text style={sharedStyles.emptyIcon}>💔</Text>
        <Text style={sharedStyles.emptyTitle}>No Favorites Yet</Text>
        <Text style={sharedStyles.emptyMessage}>
          Start exploring dishes and tap the heart icon to add them to your favorites!
        </Text>
      </View>
    );
  }

  return (
    <View style={favoritesStyles.container}>
      <View style={favoritesStyles.header}>
        <Text style={favoritesStyles.headerTitle}>❤️ My Favorites</Text>
        <Text style={favoritesStyles.headerSubtitle}>
          {favorites.length} favorite dish{favorites.length === 1 ? '' : 'es'}
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <FavoriteCard item={item} />}
        contentContainerStyle={favoritesStyles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchFavorites}
      />

      <DishDetailsModal />
    </View>
  );
}

