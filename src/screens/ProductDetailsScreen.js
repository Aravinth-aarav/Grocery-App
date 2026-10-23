/**
 * ProductDetailsScreen.js
 * Figma-styled Product Details:
 * - Gradient background (#D9F7B0 -> #FFF1CF)
 * - Round icon buttons (Back and Heart) at top
 * - Large product image in rounded card with zoom-in entrance
 * - Pagination dots below image
 * - Product name alongside horizontal yellow circular - qty + selector
 * - Star rating & reviews
 * - Expandable Description ("See more" / "See less") with LayoutAnimation
 * - Related Items horizontal scroll row (same category)
 * - Sticky bottom bar with Total Price and "Add to Cart ›››" olive gradient button
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import RoundIconButton from '../components/RoundIconButton';
import QtyStepper from '../components/QtyStepper';
import GradientButton from '../components/GradientButton';
import { useProducts } from '../context/ProductsContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { COLORS, FONTS } from '../theme';
import { formatPrice } from '../utils/format';
import { scaleFont } from '../utils/responsive';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProductDetailsScreen({ navigation, route }) {
  const { productId } = route.params;
  const { products } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === productId);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  // Animations
  const imgScale = useRef(new Animated.Value(0.92)).current;
  const imgOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  // Animated dots
  const dotWidths = useRef([
    new Animated.Value(22),
    new Animated.Value(8),
    new Animated.Value(8),
  ]).current;

  const handleDotPress = (idx) => {
    setActiveDot(idx);
    dotWidths.forEach((w, i) => {
      Animated.spring(w, {
        toValue: i === idx ? 22 : 8,
        friction: 6,
        tension: 80,
        useNativeDriver: false,
      }).start();
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(imgOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(imgScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [productId]);

  const toggleHeart = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.35,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    if (product) {
      toggleFavorite(product.id);
    }
  };

  const toggleDescription = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDescExpanded(!isDescExpanded);
  };

  // Related products from the same category
  const relatedItems = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 6);
  }, [products, product]);

  if (!product) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.notFoundContainer}>
            <Ionicons name="alert-circle-outline" size={54} color={COLORS.textHint} />
            <Text style={styles.notFound}>Product not found in AS Mart catalog.</Text>
            <GradientButton
              title="Back to Catalog"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 18 }}
            />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    Alert.alert(
      'Added to Cart! 🛒',
      `${quantity}x ${product.name} (${formatPrice(product.price * quantity)}) added to your cart.`
    );
  };

  const favoriteActive = isFavorite(product.id);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header with Round Icon Buttons */}
        <View style={styles.header}>
          <RoundIconButton
            name="chevron-back"
            size={24}
            onPress={() => navigation.goBack()}
          />

          <RoundIconButton
            icon={
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons
                  name={favoriteActive ? 'heart' : 'heart-outline'}
                  size={22}
                  color={favoriteActive ? COLORS.heart : COLORS.textPrimary}
                />
              </Animated.View>
            }
            onPress={toggleHeart}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Large Product Image in Cream Card */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                opacity: imgOpacity,
                transform: [{ scale: imgScale }],
              },
            ]}
          >
            {imageError || !product.image ? (
              <View style={styles.placeholderImage}>
                <Ionicons name="basket-outline" size={72} color={COLORS.accentOlive} />
                <Text style={styles.placeholderBrand}>AS Mart Produce</Text>
              </View>
            ) : (
              <Image
                source={{ uri: product.image }}
                style={styles.image}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            )}
          </Animated.View>

          {/* Dots Indicator with Smooth Animated Width */}
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleDotPress(idx)}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Animated.View
                  style={[
                    styles.dot,
                    activeDot === idx ? styles.dotActive : styles.dotInactive,
                    { width: dotWidths[idx] },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Content Card */}
          <View style={styles.detailsCard}>
            {/* Title & Horizontal Yellow Stepper */}
            <View style={styles.titleAndStepperRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productWeight}>
                  {product.weight ? product.weight : '1 kg'}
                </Text>
              </View>

              <QtyStepper
                quantity={quantity}
                onIncrease={() => setQuantity((q) => q + 1)}
                onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
                orientation="horizontal"
              />
            </View>

            {/* Star Rating & Category Chip */}
            <View style={styles.ratingAndTagRow}>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={17} color={COLORS.star} />
                <Text style={styles.ratingScore}>
                  {product.rating ? product.rating.toFixed(1) : '4.8'}
                </Text>
                <Text style={styles.reviewsCount}>
                  ({product.reviews || 95} reviews)
                </Text>
              </View>

              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>
            </View>

            {/* Description with See more / See less */}
            <View style={styles.descriptionBlock}>
              <Text style={styles.sectionHeader}>Description</Text>
              <Text
                style={styles.descriptionText}
                numberOfLines={isDescExpanded ? undefined : 3}
              >
                {product.description ||
                  'Naturally grown, high quality fresh produce straight from verified farms to AS Mart customers. Rich in nutrients and packed with care.'}
              </Text>
              <TouchableOpacity
                onPress={toggleDescription}
                style={styles.seeMoreBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.seeMoreText}>
                  {isDescExpanded ? 'See less' : 'See more'}
                </Text>
                <Ionicons
                  name={isDescExpanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  color={COLORS.accentOlive}
                />
              </TouchableOpacity>
            </View>

            {/* Related Items Horizontal Row */}
            {relatedItems.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={styles.sectionHeader}>Related Items</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedScroll}
                >
                  {relatedItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.relatedThumbCard}
                      onPress={() =>
                        navigation.push('ProductDetails', { productId: item.id })
                      }
                      activeOpacity={0.8}
                    >
                      <View style={styles.relatedImageBox}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.relatedImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text
                        style={styles.relatedName}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.name}
                      </Text>
                      <Text style={styles.relatedPrice}>
                        {formatPrice(item.price)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar with Total Price & Add to Cart ››› */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomPriceCol}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.totalPrice}>
              {formatPrice(product.price * quantity)}
            </Text>
          </View>

          <View style={{ flex: 1, marginLeft: 16 }}>
            <GradientButton
              title="Add to Cart"
              onPress={handleAddToCart}
              showTrailingChevrons={true}
              style={{ paddingVertical: 14 }}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 6,
    zIndex: 10,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: '88%',
    alignSelf: 'center',
    height: 250,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  image: {
    width: '88%',
    height: '88%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderBrand: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.bold,
    color: COLORS.accentOlive,
    marginTop: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.accentYellow,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#C8C8BC',
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 24,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  titleAndStepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: scaleFont(22),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  productWeight: {
    fontSize: scaleFont(FONTS.small),
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: FONTS.medium,
  },
  ratingAndTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  reviewsCount: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 183, 43, 0.15)',
  },
  categoryText: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.accentOlive,
    fontWeight: FONTS.bold,
  },
  descriptionBlock: {
    marginBottom: 18,
  },
  sectionHeader: {
    fontSize: scaleFont(FONTS.body),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  seeMoreText: {
    fontSize: scaleFont(FONTS.small),
    color: COLORS.accentOlive,
    fontWeight: FONTS.bold,
  },
  relatedSection: {
    marginTop: 4,
  },
  relatedScroll: {
    gap: 12,
    paddingVertical: 8,
  },
  relatedThumbCard: {
    width: 96,
    padding: 8,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ECE8D9',
    alignItems: 'center',
  },
  relatedImageBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 247, 176, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  relatedImage: {
    width: '85%',
    height: '85%',
  },
  relatedName: {
    fontSize: scaleFont(FONTS.tiny),
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  relatedPrice: {
    fontSize: scaleFont(FONTS.tiny),
    fontWeight: FONTS.bold,
    color: COLORS.accentOlive,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEBDC',
  },
  bottomPriceCol: {
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  totalPrice: {
    fontSize: scaleFont(20),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: scaleFont(FONTS.body),
    color: COLORS.textSecondary,
  },
});
