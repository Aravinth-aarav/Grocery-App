/**
 * QtyStepper.js
 * Figma-styled yellow circular +/- quantity stepper.
 * Supports:
 * - 'horizontal' orientation (Product Details screen: - [qty] +)
 * - 'vertical' orientation (My Cart row stepper: + / [qty] / -)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

export default function QtyStepper({
  quantity = 1,
  onIncrease,
  onDecrease,
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  size = 'medium', // 'small' | 'medium'
  style,
}) {
  const isVertical = orientation === 'vertical';
  const isSmall = size === 'small';

  const btnSize = isSmall ? 28 : 36;
  const iconSize = isSmall ? 15 : 18;

  return (
    <View
      style={[
        styles.container,
        isVertical ? styles.verticalContainer : styles.horizontalContainer,
        style,
      ]}
    >
      {/* Plus button is on top in vertical stepper */}
      {isVertical ? (
        <>
          <TouchableOpacity
            style={[styles.stepBtn, { width: btnSize, height: btnSize, borderRadius: btnSize / 2 }]}
            onPress={onIncrease}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="add" size={iconSize} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.qtyText, isSmall && styles.qtyTextSmall]}>
            {quantity}
          </Text>

          <TouchableOpacity
            style={[styles.stepBtn, { width: btnSize, height: btnSize, borderRadius: btnSize / 2 }]}
            onPress={onDecrease}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="remove" size={iconSize} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.stepBtn, { width: btnSize, height: btnSize, borderRadius: btnSize / 2 }]}
            onPress={onDecrease}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="remove" size={iconSize} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.qtyText, isSmall && styles.qtyTextSmall]}>
            {quantity}
          </Text>

          <TouchableOpacity
            style={[styles.stepBtn, { width: btnSize, height: btnSize, borderRadius: btnSize / 2 }]}
            onPress={onIncrease}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add" size={iconSize} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  verticalContainer: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#EFEBDC',
  },
  stepBtn: {
    backgroundColor: COLORS.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4B800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  qtyText: {
    fontSize: FONTS.h3,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginHorizontal: 16,
    marginVertical: 4,
    minWidth: 20,
    textAlign: 'center',
  },
  qtyTextSmall: {
    fontSize: FONTS.caption,
    marginHorizontal: 8,
    marginVertical: 4,
  },
});
