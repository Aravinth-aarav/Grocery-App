/**
 * ProductCard.js
 * Figma-styled cream card (#FFF8E6 with #FFFDF3 -> #FFF1CF gradient),
 * 20px radius, soft drop shadow, staggered fade + slide up entrance (60ms delay),
 * press-scale spring feedback (0.96), animated heart pop (1 -> 1.4 -> 1),
 * yellow round add-to-cart button, and animated flying "+1" badge.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../theme';
import { formatPrice } from '../utils/format';
import { getCardWidth, scaleFont } from '../utils/responsive';

export default function ProductCard({
  product,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  onPress,
  isAdmin = false,
  onEdit,
  onDelete,
  cardWidth,
  index = 0,
}) {
  const { width } = useWindowDimensions();
  const dynamicWidth = cardWidth || getCardWidth(width, 32, 14);
  const [imageError, setImageError] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);

  // Entrance and interaction animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const addBtnScale = useRef(new Animated.Value(1)).current;

  // Flying "+1" animation
  const plusOneOpacity = useRef(new Animated.Value(0)).current;
  const plusOneTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance: each card delayed by 60 ms
    const delay = Math.min(index * 60, 500);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [index]);

  const handleCardPressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.96,
      friction: 6,
      tension: 100,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handleHeartPress = () => {
    // Heart pop animation: scale 1 -> 1.4 -> 1
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.4,
        duration: 130,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  const handleAddToCartPress = () => {
    // Button bounce
    Animated.sequence([
      Animated.timing(addBtnScale, {
        toValue: 0.85,
        duration: 90,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(addBtnScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Trigger flying "+1" badge animation
    setShowPlusOne(true);
    plusOneOpacity.setValue(1);
    plusOneTranslateY.setValue(0);

    Animated.parallel([
      Animated.timing(plusOneTranslateY, {
        toValue: -28,
        duration: 550,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(plusOneOpacity, {
        toValue: 0,
        duration: 550,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setShowPlusOne(false);
    });

    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  return (
    <Animated.View
      style={[
        styles.outerContainer,
        {
          width: dynamicWidth,
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: cardScale },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={handleCardPressIn}
        onPressOut={handleCardPressOut}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={COLORS.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Image & Heart Container */}
          <View style={styles.imageBox}>
            {imageError || !product.image ? (
              <View style={styles.placeholderContainer}>
                <Ionicons name="basket-outline" size={40} color={COLORS.accentOlive} />
                <Text style={styles.placeholderText}>AS Mart</Text>
              </View>
            ) : (
              <Image
                source={{ uri: product.image }}
                style={styles.image}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            )}

            {/* Circular Heart Button with Pop Animation */}
            {!isAdmin && (
              <TouchableOpacity
                onPress={handleHeartPress}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.heartButton}
              >
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite ? COLORS.heart : COLORS.textSecondary}
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>

          {/* Details */}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {product.name}
            </Text>
            <Text style={styles.weight}>
              {product.weight ? product.weight : '1 kg'}
            </Text>

            {/* Price & Add to Cart row */}
            <View style={styles.footerRow}>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>
                <Text style={styles.perKg}>/kg</Text>
              </View>

              {isAdmin ? (
                <View style={styles.adminActionGroup}>
                  <TouchableOpacity
                    style={[styles.adminBtn, styles.editBtn]}
                    onPress={() => onEdit && onEdit(product)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="pencil" size={14} color={COLORS.accentOlive} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.adminBtn, styles.deleteBtn]}
                    onPress={() => onDelete && onDelete(product.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="trash" size={14} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.addBtnContainer}>
                  {/* Flying +1 indicator */}
                  {showPlusOne && (
                    <Animated.View
                      style={[
                        styles.flyingPlusOne,
                        {
                          opacity: plusOneOpacity,
                          transform: [{ translateY: plusOneTranslateY }],
                        },
                      ]}
                      pointerEvents="none"
                    >
                      <Text style={styles.plusOneText}>+1</Text>
                    </Animated.View>
                  )}

                  <Animated.View style={{ transform: [{ scale: addBtnScale }] }}>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={handleAddToCartPress}
                      activeOpacity={0.8}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="add" size={20} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  imageBox: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: 6,
  },
  image: {
    width: '92%',
    height: '92%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: scaleFont(FONTS.tiny),
    fontWeight: FONTS.bold,
    color: COLORS.accentOlive,
    marginTop: 4,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    marginTop: 10,
  },
  name: {
    fontSize: scaleFont(FONTS.body),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  weight: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontWeight: FONTS.medium,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: scaleFont(FONTS.body),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  perKg: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    marginLeft: 2,
    fontWeight: FONTS.medium,
  },
  addBtnContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  flyingPlusOne: {
    position: 'absolute',
    top: -6,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  plusOneText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  adminActionGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  adminBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: COLORS.accentOlive,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
});
