/**
 * CategoryChip.js
 * Pill chip for grocery category selection.
 * Selected: Yellow #FFE11A with bold #1C1C1C text and slight scale bounce.
 * Inactive: Soft grey #B9B9AE text on light pill.
 */

import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { COLORS, FONTS } from '../theme';

export default function CategoryChip({
  label,
  selected = false,
  onPress,
  style,
}) {
  const scaleAnim = useRef(new Animated.Value(selected ? 1.05 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 1.04 : 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 30,
      bounciness: 6,
    }).start();
  }, [selected]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        style={[
          styles.chip,
          selected ? styles.chipSelected : styles.chipInactive,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.text,
            selected ? styles.textSelected : styles.textInactive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: COLORS.accentYellow,
    borderColor: '#F0D400',
    shadowColor: '#D4B800',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  chipInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderColor: '#E8E5D6',
  },
  text: {
    fontSize: FONTS.caption,
    letterSpacing: 0.2,
  },
  textSelected: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.bold,
  },
  textInactive: {
    color: COLORS.inactiveChip,
    fontWeight: FONTS.medium,
  },
});
