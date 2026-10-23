/**
 * CustomButton – reusable button with primary/outline variants.
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from '../theme';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'outline' | 'danger'
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isPrimary && styles.primary,
        isDanger && styles.danger,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isDanger ? COLORS.white : COLORS.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            isDanger && styles.dangerText,
            variant === 'outline' && styles.outlineText,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FONTS.body,
    fontWeight: FONTS.semiBold,
  },
  primaryText: {
    color: COLORS.white,
  },
  dangerText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.textHint,
  },
});
