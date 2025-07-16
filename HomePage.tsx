import { Feather, MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from './lib/supabase';
import { sharedStyles, homePageStyles } from './sharedStyles';
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
    } | {
      name: string;
    }[];
  } | {
    average_rating?: number;
    USERS?: {
      name: string;
    } | {
      name: string;
    }[];
  }[];
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
              chef: d.CHEFS && getChefName(d.CHEFS)
                ? {
                    name: getChefName(d.CHEFS)!,
                    average_rating: getChefRating(d.CHEFS),
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
      style={[sharedStyles.card, isGridView ? sharedStyles.gridCard : sharedStyles.listCard]}
      onPress={() => openDishDetails(item)}
    >
      {/* Image Container with Overlays */}
      <View style={sharedStyles.imageContainer}>
        <Image source={{ uri: item.image }} style={sharedStyles.cardImage} />

        {/* Heart Icon */}
        <TouchableOpacity
          onPress={() => {
            const dishId: string = String(item.id);
            handleToggleFavorite(dishId);
          }}
          style={sharedStyles.heartButton}
        >
          {item.isFavorite ? (
            <Text style={sharedStyles.heartIcon}>❤️</Text>
          ) : (
            <Text style={sharedStyles.heartIcon}>🤍</Text>
          )}
        </TouchableOpacity>

        {/* Price Tag */}
        <View style={sharedStyles.priceTag}>
          <Text style={sharedStyles.priceText}>
            ₹{item.price}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={sharedStyles.cardContent}>
        <View style={sharedStyles.cardContentMain}>
          {/* Left side content */}
          <View style={sharedStyles.leftContent}>
            <Text style={sharedStyles.dishName} numberOfLines={1}>
              {item.name}
            </Text>

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
        <View style={sharedStyles.detailsModalOverlay}>
          <View style={sharedStyles.detailsModalContainer}>
            <ScrollView style={sharedStyles.detailsModalContent} showsVerticalScrollIndicator={false}>
              {/* Close Button */}
              <TouchableOpacity onPress={closeDishDetails} style={sharedStyles.detailsCloseButton}>
                <MaterialIcons name="close" size={24} color="#333" />
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

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={homePageStyles.header}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#333' }}>YummiChef</Text>
        <Text style={{ fontSize: 14, fontWeight: '400', color: '#333' }}>
          Authentic home-cooked meals✨
        </Text>
      </View>

      {/* Search */}
      <View style={homePageStyles.searchBar}>
        <Feather name="search" size={20} color="#666" style={homePageStyles.searchIcon} />
        <TextInput
          style={homePageStyles.searchInput}
          placeholder="Search dishes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Controls */}
      <View style={homePageStyles.controlsRow}>
        <TouchableOpacity style={homePageStyles.controlButton} onPress={() => setSortModalVisible(true)}>
          <Text style={homePageStyles.controlButtonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity style={homePageStyles.controlButton} onPress={() => setFilterModalVisible(true)}>
          <Text style={homePageStyles.controlButtonText}>Filter</Text>
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
        <View style={homePageStyles.modalOverlay}>
          <View style={homePageStyles.modalContent}>
            <Text style={homePageStyles.modalTitle}>Sort By</Text>
            {['rating', 'price', 'cookingTime', 'spiceLevel'].map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setSortBy(option as any);
                  setSortModalVisible(false);
                }}
                style={{
                  backgroundColor: sortBy === option ? '#FF6B6B' : '#f5f5f5',
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: sortBy === option ? '#fff' : '#333' }}>
                  {option === 'cookingTime' ? 'Cooking Time' :
                    option === 'spiceLevel' ? 'Spice Level' :
                      option.charAt(0).toUpperCase()  + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setSortModalVisible(false)}>
              <Text style={homePageStyles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={homePageStyles.modalOverlay}>
          <View style={homePageStyles.modalContainer}>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              style={homePageStyles.closeIcon}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={homePageStyles.modalScroll}>
              <Text style={homePageStyles.modalTitle}>Filter Options</Text>

              {/* Dietary */}
              <Text style={homePageStyles.filterLabel}>Dietary Preferences</Text>
              {['vegetarian', 'non-vegetarian', 'eggitarian', 'vegan'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilters({ ...filters, dietaryType: type })}
                  style={{
                    backgroundColor: filters.dietaryType === type ? '#FF6B6B' : '#f5f5f5',
                    padding: 8,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: filters.dietaryType === type ? '#fff' : '#333' }}>
                    {type.charAt(0).toUpperCase() +  type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Price */}
              <Text style={homePageStyles.filterLabel}>Max Price: ₹{filters.maxPrice}</Text>
              <Slider
                minimumValue={0}
                maximumValue={2000}
                step={50}
                value={filters.maxPrice}
                onValueChange={(value) => setFilters({ ...filters, maxPrice: value })}
                minimumTrackTintColor="#FF6B6B"
                maximumTrackTintColor="#f5f5f5"
              />

              {/* Cooking Time */}
              <Text style={homePageStyles.filterLabel}>Max Cooking Time: {filters.maxCookingTime} min</Text>
              <Slider
                minimumValue={10}
                maximumValue={120}
                step={5}
                value={filters.maxCookingTime}
                onValueChange={(value) => setFilters({ ...filters, maxCookingTime: value })}
                minimumTrackTintColor="#FF6B6B"
                maximumTrackTintColor="#f5f5f5"
              />

              {/* Cuisine */}
              <Text style={homePageStyles.filterLabel}>Cuisine</Text>
              <TextInput
                style={homePageStyles.searchInput}
                placeholder="e.g., Indian, Chinese"
                value={filters.cuisine}
                onChangeText={(text) => setFilters({ ...filters, cuisine: text })}
              />

              {/* Exclude Ingredients */}
              <Text style={homePageStyles.filterLabel}>Exclude Ingredients</Text>
              <TextInput
                style={homePageStyles.searchInput}
                placeholder="e.g., onion, garlic"
                value={filters.excludeIngredients}
                onChangeText={(text) => setFilters({ ...filters, excludeIngredients: text })}
              />

              {/* Service Type */}
              <Text style={homePageStyles.filterLabel}>Service Type</Text>
              {['home-delivery', 'chef-at-home'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilters({ ...filters, serviceType: type })}
                  style={{
                    backgroundColor: filters.serviceType === type ? '#FF6B6B' : '#f5f5f5',
                    padding: 8,
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: filters.serviceType === type ? '#fff' : '#333' }}>
                    {type === 'home-delivery' ? 'Home-Cooked Delivery' : 'Chef at Home'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sticky Buttons */}
            <View style={homePageStyles.filterFooter}>
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
                style={[homePageStyles.controlButton, { flex: 1, marginRight: 10 }]}
              >
                <Text style={homePageStyles.controlButtonText}>Clear Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={[homePageStyles.controlButton, { flex: 1, marginLeft: 10 }]}
              >
                <Text style={homePageStyles.controlButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <DishDetailsModal />
    </View>
  );
}