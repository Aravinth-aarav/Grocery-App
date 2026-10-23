/**
 * CartItem.js
 * Figma-styled cart row card with cream gradient, 20px radius,
 * product thumbnail, name, category, ₹ price/kg,
 * and a vertical yellow +/- stepper on the right.
 * Animated entrance and removal.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QtyStepper from './QtyStepper';
import { COLORS, FONTS } from '../theme';
import { formatPrice } from '../utils/format';
import { scaleFont } from '../utils/responsive';

export default function CartItem({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
  index = 0,
}) {
  const [imageError, setImageError] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const itemScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: Math.min(index * 60, 360),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay: Math.min(index * 60, 360),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [index]);

  const handleRemove = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(itemScale, {
        toValue: 0.8,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      if (onRemove) onRemove();
    });
  };

  if (!product) return null;

  return (
    <Animated.View
      style={[
        styles.outerContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: itemScale }],
        },
      ]}
    >
      <LinearGradient
        colors={COLORS.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.cardGradient}
      >
        {/* Product Thumbnail */}
        <View style={styles.thumbnailBox}>
          {imageError || !product.image ? (
            <Ionicons name="basket-outline" size={32} color={COLORS.accentOlive} />
          ) : (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {product.name}
          </Text>
          <Text style={styles.category}>{product.category || 'Grocery'}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.perUnit}>
              {product.weight ? ` / ${product.weight}` : ' / kg'}
            </Text>
          </View>
        </View>

        {/* Vertical Yellow Stepper & Delete */}
        <View style={styles.rightControls}>
          <TouchableOpacity
            onPress={handleRemove}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={17} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <QtyStepper
            quantity={quantity}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            orientation="vertical"
            size="small"
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardGradient: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  thumbnailBox: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    overflow: 'hidden',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontSize: scaleFont(FONTS.body),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: scaleFont(FONTS.body),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  perUnit: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    marginLeft: 2,
    fontWeight: FONTS.medium,
  },
  rightControls: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteBtn: {
    padding: 3,
    marginBottom: 4,
  },
});
