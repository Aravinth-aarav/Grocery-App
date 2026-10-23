/**
 * EditProfileScreen.js
 * Figma-styled Edit Profile Screen:
 * - GradientBackground (#D9F7B0 -> #FFF1CF)
 * - RoundIconButton back button
 * - Glass rounded input fields (75% white)
 * - Olive gradient Save Changes button (#D6C53A -> #B8A622)
 * - Validation and AsyncStorage persistence
 */

import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import GradientBackground from '../components/GradientBackground';
import RoundIconButton from '../components/RoundIconButton';
import GradientButton from '../components/GradientButton';
import CustomInput from '../components/CustomInput';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import { scaleFont } from '../utils/responsive';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) errs.name = 'Name is required.';
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!emailRegex.test(email)) errs.email = 'Enter a valid email address.';

    if (!phone.trim()) errs.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(phone))
      errs.phone = 'Phone must be exactly 10 digits.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    Alert.alert('Profile Updated', 'Your profile details have been updated successfully.');
    navigation.goBack();
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid =
    name.trim().length > 0 &&
    emailRegex.test(email) &&
    /^\d{10}$/.test(phone);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <RoundIconButton
              name="chevron-back"
              size={24}
              onPress={() => navigation.goBack()}
              style={{ marginBottom: 18 }}
            />

            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>
              Update your delivery address, phone, and contact preferences.
            </Text>

            {/* Glass Form Inputs */}
            <CustomInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              autoCapitalize="words"
              error={errors.name}
            />

            <CustomInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={errors.email}
            />

            <CustomInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
            />

            <CustomInput
              label="Delivery Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Flat no., street, city, pin code"
              autoCapitalize="sentences"
            />

            <GradientButton
              title="Save Changes"
              onPress={handleSave}
              disabled={!isValid}
              showTrailingChevrons={true}
              style={{ marginTop: 14 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 36,
  },
  title: {
    fontSize: scaleFont(28),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
});
