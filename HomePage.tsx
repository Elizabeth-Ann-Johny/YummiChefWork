import { Feather, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { theme } from '../../lib/theme';
import Loading from './loading';

// Database response type (snake_case) - matches your actual Supabase schema
type DatabaseDish = {
  id: string;
  name: string | null;
  description: string | null;
  image: string | null;
  alergens: string | null;
  cooking_time: number | null;
  price: number | null;
  rating: number | null;
  spice_level: number | null;
  service_type: string | null;
  cuisine: string | null;
  ingredients: string[] | null;
  dietary_type: string | null;
  chef_id?: string | null;
  CHEFS?: {
    average_rating?: number;
    USERS?: {
      name: string;
    };
  };
};

type DatabaseReview = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  dish_id?: string; // Optional since we don't select it when fetching for a specific dish
  USERS?: {
    name: string;
  }[] | null;
};

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  userName: string;
}

// Frontend type (camelCase)
interface Dish {
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
}

export default function HomePage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'cookingTime' | 'spiceLevel'>('rating');
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [filters, setFilters] = useState({
    cuisine: '',
    maxPrice: 1000,
    maxCookingTime: 60,
    minRating: 0,
    excludeIngredients: '',
    serviceType: '',
    dietaryType: '',
  });

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

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        console.log('Fetching dishes from Supabase...');
        const { data: dishesData, error: dishesError } = await supabase
          .from('dishes')
          .select(`
            id,
            name,
            description,
            image,
            alergens,
            cooking_time,
            price,
            rating,
            spice_level,
            service_type,
            cuisine,
            ingredients,
            dietary_type,
            chef_id,
            CHEFS (
              average_rating,
              USERS (
                name
              )
            )
          `);

        console.log('Dishes query result:', { dishesData, dishesError });

        const { data: userData } = await supabase.auth.getUser();

        if (dishesError) {
          console.error('Error fetching dishes:', dishesError);
          Alert.alert('Error', 'Failed to load dishes. Please try again.');
          setLoading(false);
          return;
        }

        if (!dishesData) {
          console.log('No dishes found');
          setDishes([]);
          setLoading(false);
          return;
        }

        let favoriteIds: string[] = [];
        if (userData?.user) {
          const { data: favoritesData } = await supabase
            .from('favorites')
            .select('dish_id')
            .eq('user_id', userData.user.id);

          favoriteIds = favoritesData?.map(fav => fav.dish_id) || [];
        }

                // No need to fetch reviews for dish cards anymore

        // Transform database snake_case to camelCase for TypeScript interface
        const dishesWithFavorites: Dish[] = (dishesData as DatabaseDish[])
          .filter(d => d.name && d.description && d.price && d.image && d.cooking_time && d.rating)
          .map((d): Dish => {
            const dish: Dish = {
              id: d.id as string,
              name: String(d.name!),
              description: String(d.description!),
              price: Number(d.price!),
              image: String(d.image!),
              cookingTime: Number(d.cooking_time!),
              rating: Number(d.rating!),
              spiceLevel: d.spice_level ? Number(d.spice_level) : 0,
              serviceType: d.service_type || 'home-delivery',
              cuisine: d.cuisine || 'unknown',
              ingredients: d.ingredients || [],
              dietaryType: d.dietary_type || 'vegetarian',
                                            chef: d.CHEFS?.USERS
                 ? {
                     name: d.CHEFS.USERS.name,
                     average_rating: d.CHEFS.average_rating ?? 0,
                   }
                 : undefined,
               reviews: [], // No reviews in dish cards
               allergens: d.alergens || '',
               isFavorite: favoriteIds.includes(String(d.id)),
            };
            return dish;
          });

        setDishes(dishesWithFavorites);
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error fetching dishes:', error);
        Alert.alert('Error', 'Something went wrong while loading dishes.');
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  const handleToggleFavorite = async (dishId: string): Promise<void> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        Alert.alert('Login Required', 'Please log in to save favorites');
        return;
      }

      const currentDish = dishes.find((d: Dish) => String(d.id) === String(dishId));
      const isFavorite = currentDish?.isFavorite;

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('dish_id', dishId);

        if (error) {
          console.error('Error removing favorite:', error);
          Alert.alert('Error', 'Failed to remove from favorites');
          return;
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userData.user.id, dish_id: dishId });

        if (error) {
          console.error('Error adding favorite:', error);
          Alert.alert('Error', 'Failed to add to favorites');
          return;
        }
      }

      // Update local state only if database operation was successful
      setDishes(prev =>
        prev.map((dish: Dish) =>
          String(dish.id) === String(dishId) ? { ...dish, isFavorite: !dish.isFavorite } : dish
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const getSpiceEmojis = (level: number = 0): string => {
    return '🌶️'.repeat(Math.min(level, 5));
  };

  const filterDishes = (items: Dish[]): Dish[] => {
    return items.filter((dish) => {
      if (filters.cuisine && dish.cuisine !== filters.cuisine) return false;
      if (dish.price > filters.maxPrice) return false;
      if (dish.cookingTime > filters.maxCookingTime) return false;
      if (dish.rating < filters.minRating) return false;
      if (filters.serviceType && dish.serviceType !== filters.serviceType) return false;
      if (filters.dietaryType && dish.dietaryType !== filters.dietaryType) return false;
      if (filters.excludeIngredients) {
        const excludeList = filters.excludeIngredients.toLowerCase().split(',');
        const hasExcluded = dish.ingredients?.some((ingredient) =>
          excludeList.some((excluded) => ingredient.toLowerCase().includes(excluded.trim()))
        );
        if (hasExcluded) return false;
      }
      return dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const sortDishes = (items: Dish[]): Dish[] => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'cookingTime':
          return a.cookingTime - b.cookingTime;
        case 'rating':
          return b.rating - a.rating;
        case 'spiceLevel':
          return (b.spiceLevel ?? 0) - (a.spiceLevel ?? 0);
        default:
          return 0;
      }
    });
  };

  const processedDishes = useMemo(
    () => sortDishes(filterDishes(dishes)),
    [dishes, searchQuery, filters, sortBy]
  );

  if (loading) return <Loading />;

  const DishCard: React.FC<{ item: Dish }> = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, isGridView ? styles.gridCard : styles.listCard]}
      onPress={() => openDishDetails(item)}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      {/* Heart Icon */}
      <TouchableOpacity
        onPress={() => {
          const dishId: string = String(item.id);
          handleToggleFavorite(dishId);
        }}
        style={styles.heartButton}
      >
        {item.isFavorite ? (
          <Text style={styles.heartIcon}>❤️</Text>
        ) : (
          <Text style={styles.heartIcon}>🤍</Text>
        )}
      </TouchableOpacity>

      {/* Content Section */}
      <View style={styles.cardContent}>
        <Text style={styles.dishName} numberOfLines={1}>
          {item.name}
        </Text>

        {/* Service Type */}
        <View style={styles.serviceTag}>
          <Text style={styles.serviceTagText}>
            {item.serviceType === 'chef-at-home' ? 'Chef at Home' : 'Home Delivery'}
          </Text>
        </View>

        {/* Dietary Type */}
        <View style={[
          styles.dietaryTag,
          { backgroundColor: item.dietaryType === 'vegetarian' ? '#4CAF50' : '#FF9800' }
        ]}>
          <Text style={styles.dietaryTagText}>
            {item.dietaryType === 'vegetarian' ? 'vegetarian' : 'non-vegetarian'}
          </Text>
        </View>

        {/* Cuisine */}
        <Text style={styles.cuisineText}>
          {item.cuisine?.toUpperCase() || 'CUISINE'}
        </Text>

        {/* Rating and Cooking Time */}
        <View style={styles.metaInfo}>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.clockIcon}>⏱️</Text>
            <Text style={styles.timeText}>{item.cookingTime} min</Text>
          </View>
        </View>
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

                {/* Chef Info */}
                <View style={styles.detailsModalSection}>
                  <Text style={styles.detailsModalSectionTitle}>Chef</Text>
                  <View style={styles.detailsModalChefContainer}>
                    <View style={styles.detailsModalChefInfo}>
                      <Text style={styles.detailsModalChefName}>
                        Chef {selectedDish.chef?.name ?? 'Unknown'}
                      </Text>
                      <Text style={styles.detailsModalChefRatingText}>
                        Rating: {selectedDish.chef?.average_rating ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

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

  return (
    <View style={{ flex: 1, backgroundColor: theme.COLORS.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: theme.COLORS.primary }}>YummiChef</Text>
        <Text style={{ fontSize: 14, fontWeight: '400', color: theme.COLORS.primary }}>
          Authentic home-cooked meals✨
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.controlButtonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => setFilterModalVisible(true)}>
          <Text style={styles.controlButtonText}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => setIsGridView(!isGridView)}>
          <Text style={styles.controlButtonText}>{isGridView ? 'List' : 'Grid'}</Text>
        </TouchableOpacity>
      </View>

      {/* Dishes List */}
      <FlatList
        data={processedDishes}
        keyExtractor={(item) => item.id}
        numColumns={isGridView ? 2 : 1}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => <DishCard item={item} />}
      />

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {['rating', 'price', 'cookingTime', 'spiceLevel'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSortBy(option as any);
                  setSortModalVisible(false);
                }}
                style={{
                  backgroundColor: sortBy === option ? theme.COLORS.accent : theme.COLORS.gray,
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: sortBy === option ? theme.COLORS.primary : theme.COLORS.text }}>
                  {option === 'cookingTime' ? 'Cooking Time' :
                    option === 'spiceLevel' ? 'Spice Level' :
                      option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setSortModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={styles.closeIcon}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalTitle}>Filter Options</Text>

              {/* Dietary */}
              <Text style={styles.filterLabel}>Dietary Preferences</Text>
              {['vegetarian', 'non-vegetarian', 'eggitarian', 'vegan'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilters({ ...filters, dietaryType: type })}
                  style={{
                    backgroundColor: filters.dietaryType === type ? theme.COLORS.accent : theme.COLORS.gray,
                    padding: 8,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: filters.dietaryType === type ? theme.COLORS.primary : theme.COLORS.text }}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Price */}
              <Text style={styles.filterLabel}>Max Price: ₹{filters.maxPrice}</Text>
              <Slider
                minimumValue={0}
                maximumValue={2000}
                step={50}
                value={filters.maxPrice}
                onValueChange={(value) => setFilters({ ...filters, maxPrice: value })}
                minimumTrackTintColor={theme.COLORS.accent}
                maximumTrackTintColor={theme.COLORS.gray}
              />

              {/* Cooking Time */}
              <Text style={styles.filterLabel}>Max Cooking Time: {filters.maxCookingTime} min</Text>
              <Slider
                minimumValue={10}
                maximumValue={120}
                step={5}
                value={filters.maxCookingTime}
                onValueChange={(value) => setFilters({ ...filters, maxCookingTime: value })}
                minimumTrackTintColor={theme.COLORS.accent}
                maximumTrackTintColor={theme.COLORS.gray}
              />

              {/* Cuisine */}
              <Text style={styles.filterLabel}>Cuisine</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="e.g., Indian, Chinese"
                value={filters.cuisine}
                onChangeText={(text) => setFilters({ ...filters, cuisine: text })}
              />

              {/* Exclude Ingredients */}
              <Text style={styles.filterLabel}>Exclude Ingredients</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="e.g., onion, garlic"
                value={filters.excludeIngredients}
                onChangeText={(text) => setFilters({ ...filters, excludeIngredients: text })}
              />

              {/* Service Type */}
              <Text style={styles.filterLabel}>Service Type</Text>
              {['home-delivery', 'chef-at-home'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilters({ ...filters, serviceType: type })}
                  style={{
                    backgroundColor: filters.serviceType === type ? theme.COLORS.accent : theme.COLORS.gray,
                    padding: 8,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: filters.serviceType === type ? theme.COLORS.primary : theme.COLORS.text }}>
                    {type === 'home-delivery' ? 'Home-Cooked Delivery' : 'Chef at Home'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sticky Buttons */}
            <View style={styles.filterFooter}>
              <TouchableOpacity
                onPress={() =>
                  setFilters({
                    cuisine: '',
                    maxPrice: 1000,
                    maxCookingTime: 60,
                    minRating: 0,
                    excludeIngredients: '',
                    serviceType: '',
                    dietaryType: '',
                  })
                }
                style={[styles.controlButton, { flex: 1, marginRight: 10 }]}
              >
                <Text style={styles.controlButtonText}>Clear Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={[styles.controlButton, { flex: 1, marginLeft: 10 }]}
              >
                <Text style={styles.controlButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <DishDetailsModal />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.white,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
    margin: 5,
    height: 300,
    position: 'relative',
  },
  gridCard: { maxWidth: '48%' },
  listCard: { width: '100%', height: 200 },
  cardImage: {
    width: '100%',
    height: '60%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },

  dishDesc: { fontSize: 12, color: '#666', marginVertical: 5 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: {
    padding: 20,
    backgroundColor: theme.COLORS.accent,
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: theme.COLORS.white,
    margin: 15,
    borderRadius: 30,
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 15,
    height: 50,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  serviceTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  serviceTagText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
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
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.COLORS.text,
    marginBottom: 8,
  },
  dietaryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  dietaryTagText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  cuisineText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: '100%',
    fontSize: 16,
    color: theme.COLORS.text,
    borderWidth: 0,
    outline: 'none',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  controlButton: {
    backgroundColor: theme.COLORS.accent,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  controlButtonText: {
    color: theme.COLORS.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.COLORS.white,
    padding: 20,
    width: '90%',
    borderRadius: 12,
    marginTop: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.COLORS.text,
  },
  closeButton: {
    color: theme.COLORS.accent,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  filterLabel: {
    fontWeight: '600',
    marginVertical: 10,
    color: theme.COLORS.text,
  },
  modalContainer: {
    backgroundColor: theme.COLORS.white,
    borderRadius: 12,
    marginTop: 60,
    width: '90%',
    alignSelf: 'center',
    maxHeight: '90%',
    paddingBottom: 10,
  },
  modalScroll: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.COLORS.white,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.border,
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
  detailsModalChefContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsModalChefInfo: {
    flex: 1,
  },
  detailsModalChefName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.COLORS.text,
  },
  detailsModalChefRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailsModalChefRatingText: {
    fontSize: 14,
    color: theme.COLORS.text,
    marginLeft: 4,
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