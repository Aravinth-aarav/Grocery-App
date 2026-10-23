/**
 * CustomInput.js
 * Glass-styled rounded input field:
 * - White background at 75% opacity (rgba(255, 255, 255, 0.75))
 * - 16px border radius with soft border and subtle shadow
 * - Password eye toggle
 * - Inline validation error support
 */

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';
import { scaleFont } from '../utils/responsive';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  style,
  editable = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = secureTextEntry && !showPassword;

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textHint}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          editable={editable}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: scaleFont(FONTS.small),
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF0F0',
  },
  inputDisabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: scaleFont(FONTS.body),
    color: COLORS.textPrimary,
  },
  eyeIcon: {
    padding: 6,
  },
  error: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.error,
    fontWeight: FONTS.medium,
    marginTop: 4,
    marginLeft: 6,
  },
});
