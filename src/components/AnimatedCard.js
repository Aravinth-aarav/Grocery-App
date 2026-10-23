/**
 * AnimatedCard.js
 * Reusable card with soft cream gradient (#FFFDF3 -> #FFF1CF),
 * 20px border radius, soft drop shadow, staggered fade+slide-up entrance,
 * and press-scale spring feedback (0.96).
 */

import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

export default function AnimatedCard({
  children,
  style,
  onPress,
  delay = 0,
  gradientColors = COLORS.cardGradient,
  activeOpacity = 0.9,
  disabled = false,
  containerStyle,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
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
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 6,
      tension: 100,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const Content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );

  return (
    <Animated.View
      style={[
        styles.wrapper,
        containerStyle,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {onPress && !disabled ? (
        <TouchableOpacity
          activeOpacity={activeOpacity}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.touchable}
        >
          {Content}
        </TouchableOpacity>
      ) : (
        Content
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
});
