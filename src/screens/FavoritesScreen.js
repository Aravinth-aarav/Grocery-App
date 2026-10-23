/**
 * FavoritesScreen.js
 * Figma-styled Favorites screen:
 * - Full-screen gradient (#D9F7B0 -> #FFF1CF)
 * - Header with RoundIconButton back and 3-dot menu (with "Clear all" action)
 * - 2-column cards layout using ProductCard
 * - Sticky "Add All to Cart" olive gradient button
 * - Animated empty state
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import RoundIconButton from '../components/RoundIconButton';
import ProductCard from '../components/ProductCard';
import GradientButton from '../components/GradientButton';
import { useProducts } from '../context/ProductsContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { COLORS, FONTS } from '../theme';
import { getGridColumns, getCardWidth, scaleFont } from '../utils/responsive';
import { formatPrice } from '../utils/format';

export default function FavoritesScreen({ navigation }) {
  const { products } = useProducts();
  const { favorites, toggleFavorite, clearFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { width } = useWindowDimensions();

  const numColumns = getGridColumns(width);
  const cardWidth = getCardWidth(width, 32, 14);

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  // Floating animation for empty state heart
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, []);

  const handleOpenMenu = () => {
    Alert.alert(
      'Favorite Options',
      'What would you like to do with your saved favorites?',
      [
        {
          text: 'Clear All Favorites',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Clear All',
              'Are you sure you want to remove all items from favorites?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear All',
                  style: 'destructive',
                  onPress: () => {
                    if (clearFavorites) {
                      clearFavorites();
                    } else {
                      favorites.forEach((id) => toggleFavorite(id));
                    }
                  },
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) return;
    favoriteProducts.forEach((p) => addToCart(p.id, 1));
    Alert.alert(
      'Added All to Cart! 🛒',
      `${favoriteProducts.length} favorite item(s) added to your cart.`
    );
  };

  const renderProduct = ({ item, index }) => (
    <ProductCard
      product={item}
      index={index}
      isFavorite={true}
      onToggleFavorite={toggleFavorite}
      onAddToCart={() => {
        addToCart(item.id, 1);
        Alert.alert('Added to Cart! 🛒', `${item.name} (${formatPrice(item.price)}) added.`);
      }}
      onPress={() =>
        navigation.navigate('ProductDetails', { productId: item.id })
      }
      cardWidth={cardWidth}
    />
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header with Back and 3-Dot Menu */}
        <View style={styles.header}>
          <RoundIconButton
            name="chevron-back"
            size={24}
            onPress={() => navigation.goBack()}
          />

          <Text style={styles.headerTitle}>Favourites</Text>

          <RoundIconButton
            name="ellipsis-vertical"
            size={20}
            onPress={handleOpenMenu}
          />
        </View>

        {favoriteProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View
              style={[
                styles.emptyHeartBox,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <Ionicons name="heart-outline" size={56} color={COLORS.heart} />
            </Animated.View>
            <Text style={styles.emptyTitle}>No Favourites Yet</Text>
            <Text style={styles.emptySubtitle}>
              Explore fresh groceries and tap the heart icon on any produce to save it for later.
            </Text>
            <GradientButton
              title="Explore Groceries"
              onPress={() => navigation.navigate('ProductsTab')}
              style={{ marginTop: 24, paddingHorizontal: 32 }}
            />
          </View>
        ) : (
          <>
            <FlatList
              key={`fav-grid-${numColumns}`}
              data={favoriteProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Sticky Bottom Bar with Add All to Cart */}
            <View style={styles.bottomBar}>
              <GradientButton
                title={`Add All to Cart (${favoriteProducts.length})`}
                onPress={handleAddAllToCart}
                showTrailingChevrons={true}
              />
            </View>
          </>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: scaleFont(FONTS.h2),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 110,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyHeartBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.heart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: scaleFont(22),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEBDC',
  },
});
