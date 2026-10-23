/**
 * SignUpScreen.js
 * Figma-styled Sign Up Screen:
 * - GradientBackground (#D9F7B0 -> #FFF1CF)
 * - RoundIconButton back button
 * - AS Mart logo
 * - Glass rounded inputs (75% white)
 * - Olive gradient button (#D6C53A -> #B8A622)
 * - Customer registration with full validation and error alerts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import GradientBackground from '../components/GradientBackground';
import RoundIconButton from '../components/RoundIconButton';
import GradientButton from '../components/GradientButton';
import CustomInput from '../components/CustomInput';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import { scaleFont } from '../utils/responsive';

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) errs.name = 'Full name is required.';
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!emailRegex.test(email.trim())) errs.email = 'Please enter a valid email address.';

    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    else if (!/\d/.test(password)) errs.password = 'Password must contain at least one number.';

    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';

    if (phone.trim() && !/^\d{10}$/.test(phone.trim())) {
      errs.phone = 'Phone number must be exactly 10 digits.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate() || loading) return;

    setLoading(true);
    try {
      const result = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });

      if (!result.success) {
        Alert.alert('Sign Up Failed', result.message || 'Unable to create your account.');
      }
    } catch (err) {
      console.error('[SignUpScreen] Error:', err);
      Alert.alert('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormValid =
    name.trim().length > 0 &&
    emailRegex.test(email.trim()) &&
    password.length >= 6 &&
    /\d/.test(password) &&
    password === confirmPassword &&
    confirmPassword.length > 0;

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
            {/* Round Back Button & Logo */}
            <View style={styles.topRow}>
              <RoundIconButton
                name="chevron-back"
                size={24}
                onPress={() => navigation.goBack()}
              />
              <Logo size="small" layout="horizontal" showTagline={false} />
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Sign up to start shopping fresh daily groceries with AS Mart!
            </Text>

            {/* Form Fields with Glass Styling */}
            <CustomInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Aravinth Kumar"
              autoCapitalize="words"
              error={errors.name}
            />

            <CustomInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. yourname@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <CustomInput
              label="Phone Number (Optional)"
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.phone}
            />

            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 chars with a number"
              secureTextEntry
              error={errors.password}
            />

            <CustomInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              secureTextEntry
              error={errors.confirmPassword}
            />

            {/* Olive Gradient Sign Up Button */}
            <GradientButton
              title={loading ? 'Creating Account...' : 'Sign Up as Customer'}
              onPress={handleSignUp}
              disabled={!isFormValid || loading}
              showTrailingChevrons={true}
              style={{ marginTop: 10 }}
            />

            {loading && (
              <ActivityIndicator
                size="small"
                color={COLORS.accentOlive}
                style={{ marginTop: 14 }}
              />
            )}

            {/* Link to Sign In */}
            <TouchableOpacity
              style={styles.switchLink}
              onPress={() => navigation.replace('SignIn', { role: 'customer' })}
              activeOpacity={0.7}
            >
              <Text style={styles.switchText}>
                Already have an account?{' '}
                <Text style={styles.switchHighlight}>Sign In</Text>
              </Text>
            </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 22,
    lineHeight: 20,
  },
  switchLink: {
    marginTop: 26,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchText: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textSecondary,
  },
  switchHighlight: {
    color: COLORS.accentOlive,
    fontWeight: FONTS.bold,
  },
});
