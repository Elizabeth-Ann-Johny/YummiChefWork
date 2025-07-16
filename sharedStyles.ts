import { StyleSheet } from 'react-native';

// Define theme colors inline to avoid path issues
const theme = {
  COLORS: {
    primary: '#333',
    accent: '#FF6B6B',
    background: '#f5f5f5',
    white: '#fff',
    text: '#333',
    gray: '#e0e0e0',
    border: '#e0e0e0',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const sharedStyles = StyleSheet.create({
  // Card styles
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
  gridCard: { 
    maxWidth: '48%' 
  },
  listCard: { 
    width: '100%', 
    height: 200 
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
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
  cardContentMain: {
    flex: 1,
  },
  leftContent: {
    flex: 1,
  },

  // Text and layout styles
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

  // Modal styles
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

  // Loading and empty states
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

// HomePage specific styles
export const homePageStyles = StyleSheet.create({
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
});

// Favorites specific styles
export const favoritesStyles = StyleSheet.create({
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
});