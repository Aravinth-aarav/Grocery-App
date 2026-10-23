/**
 * GradientButton.js
 * Figma-styled signature action button with olive gradient (#D6C53A -> #B8A622),
 * rounded 26px radius, press-scale animation (0.96 on press),
 * and looping animated arrow trail (›››).
 */

import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

export default function GradientButton({
  title,
  onPress,
  variant = 'olive', // 'olive' | 'yellow' | 'outline' | 'danger'
  showArrows = false,
  showTrailingChevrons = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) {
  const hasArrows = showArrows || showTrailingChevrons;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  // Looping animated arrow trail for "Book Now ›››", "Add to Cart ›››", "Get Started"
  useEffect(() => {
    if (hasArrows) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 5,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [hasArrows]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: Platform.OS !== 'web',
      speed: 35,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 25,
      bounciness: 5,
    }).start();
  };

  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isYellow = variant === 'yellow';

  const gradientColors = isYellow
    ? [COLORS.accentYellow, '#F6D300']
    : isDanger
    ? ['#E53935', '#C62828']
    : COLORS.buttonGradient; // Olive gradient #D6C53A -> #B8A622

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={styles.touchable}
      >
        {isOutline ? (
          <View style={[styles.outlineBtn, disabled && styles.disabled]}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <View style={styles.contentRow}>
                {icon && <View style={styles.iconWrapper}>{icon}</View>}
                <Text style={[styles.outlineText, textStyle]}>{title}</Text>
              </View>
            )}
          </View>
        ) : (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradient,
              isYellow && styles.yellowShadow,
              disabled && styles.disabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.contentRow}>
                {icon && <View style={styles.iconWrapper}>{icon}</View>}
                <Text
                  style={[
                    styles.gradientText,
                    isYellow && { color: COLORS.textPrimary },
                    textStyle,
                  ]}
                >
                  {title}
                </Text>
                {hasArrows && (
                  <Animated.View
                    style={[
                      styles.arrowTrail,
                      { transform: [{ translateX: arrowAnim }] },
                    ]}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isYellow ? COLORS.textPrimary : '#FFFFFF'}
                    />
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isYellow ? COLORS.textPrimary : '#FFFFFF'}
                      style={{ marginLeft: -10 }}
                    />
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isYellow ? COLORS.textPrimary : '#FFFFFF'}
                      style={{ marginLeft: -10 }}
                    />
                  </Animated.View>
                )}
              </View>
            )}
          </LinearGradient>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  gradient: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  yellowShadow: {
    shadowColor: '#D4B800',
    shadowOpacity: 0.35,
  },
  outlineBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientText: {
    fontSize: FONTS.body,
    fontWeight: FONTS.bold,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  outlineText: {
    fontSize: FONTS.body,
    fontWeight: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 0.4,
  },
  arrowTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  iconWrapper: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
