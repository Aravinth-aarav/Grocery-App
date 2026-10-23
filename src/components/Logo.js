/**
 * Logo.js
 * Scalable AS Mart logo component with shopping cart icon,
 * bold brand name, and "Fresh. Fast. Affordable." tagline.
 * Supports horizontal or vertical orientation and size variants.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../theme';

export default function Logo({
  size = 'medium', // 'small' | 'medium' | 'large'
  layout = 'vertical', // 'vertical' | 'horizontal'
  showTagline = true,
  textColor,
  taglineColor,
  style,
}) {
  const dimensions = {
    small: {
      circleSize: 38,
      iconSize: 20,
      titleSize: 18,
      taglineSize: 10,
      margin: 8,
    },
    medium: {
      circleSize: 56,
      iconSize: 28,
      titleSize: 24,
      taglineSize: 12,
      margin: 10,
    },
    large: {
      circleSize: 84,
      iconSize: 42,
      titleSize: 32,
      taglineSize: 14,
      margin: 14,
    },
  }[size] || {
    circleSize: 56,
    iconSize: 28,
    titleSize: 24,
    taglineSize: 12,
    margin: 10,
  };

  const isHorizontal = layout === 'horizontal';

  return (
    <View
      style={[
        styles.container,
        isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
        style,
      ]}
    >
      {/* Green Circle with White Cart Icon & Gradient Accent */}
      <LinearGradient
        colors={COLORS.gradientGreen}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.circle,
          {
            width: dimensions.circleSize,
            height: dimensions.circleSize,
            borderRadius: dimensions.circleSize / 2,
            marginRight: isHorizontal ? dimensions.margin : 0,
            marginBottom: isHorizontal ? 0 : dimensions.margin,
          },
        ]}
      >
        <Ionicons name="cart" size={dimensions.iconSize} color={COLORS.white} />
      </LinearGradient>

      {/* Brand Text & Tagline */}
      <View
        style={[
          styles.textWrapper,
          isHorizontal ? styles.horizontalText : styles.verticalText,
        ]}
      >
        <Text
          style={[
            styles.brandName,
            {
              fontSize: dimensions.titleSize,
              color: textColor || COLORS.textPrimary,
            },
          ]}
        >
          AS <Text style={styles.brandHighlight}>Mart</Text>
        </Text>
        {showTagline && (
          <Text
            style={[
              styles.tagline,
              {
                fontSize: dimensions.taglineSize,
                color: taglineColor || COLORS.textSecondary,
              },
            ]}
          >
            Fresh. Fast. Affordable.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalContainer: {
    flexDirection: 'column',
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  textWrapper: {
    justifyContent: 'center',
  },
  verticalText: {
    alignItems: 'center',
  },
  horizontalText: {
    alignItems: 'flex-start',
  },
  brandName: {
    fontWeight: FONTS.bold,
    letterSpacing: 0.5,
  },
  brandHighlight: {
    color: COLORS.primary,
  },
  tagline: {
    fontWeight: FONTS.medium,
    marginTop: 2,
    letterSpacing: 0.3,
  },
});
