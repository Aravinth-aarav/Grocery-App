/**
 * SignInScreen.js
 * Figma-styled Sign In Screen:
 * - GradientBackground (#D9F7B0 -> #FFF1CF)
 * - RoundIconButton back button
 * - AS Mart logo
 * - Role toggle with yellow active pill
 * - Glass rounded inputs (75% white)
 * - Olive gradient button (#D6C53A -> #B8A622) with trailing chevrons
 * - Async/await authentication with exact error feedback
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
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import RoundIconButton from '../components/RoundIconButton';
import GradientButton from '../components/GradientButton';
import CustomInput from '../components/CustomInput';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import { scaleFont } from '../utils/responsive';

export default function SignInScreen({ navigation, route }) {
  const [role, setRole] = useState(route.params?.role || 'customer');
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!emailRegex.test(email.trim())) errs.email = 'Enter a valid email address.';

    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6)
      errs.password = 'Password must be at least 6 characters.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate() || loading) return;

    setLoading(true);
    try {
      const result = await signIn(email.trim(), password, role);
      if (!result.success) {
        Alert.alert('Sign In Failed', result.message || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('[SignInScreen] Error:', err);
      Alert.alert('Sign In Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    email.trim().length > 0 &&
    password.length >= 6 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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
            {/* Round Back Button */}
            <View style={styles.topRow}>
              <RoundIconButton
                name="chevron-back"
                size={24}
                onPress={() => navigation.goBack()}
              />
              <Logo size="small" layout="horizontal" showTagline={false} />
            </View>

            {/* Header Titles */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to access your AS Mart account and continue shopping fresh groceries.
            </Text>

            {/* Role Toggle */}
            <View style={styles.roleToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleToggleBtn,
                  role === 'customer' && styles.roleToggleBtnActive,
                ]}
                onPress={() => setRole('customer')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person"
                  size={16}
                  color={role === 'customer' ? COLORS.textPrimary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.roleToggleText,
                    role === 'customer' && styles.roleToggleTextActive,
                  ]}
                >
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleToggleBtn,
                  role === 'admin' && styles.roleToggleBtnActive,
                ]}
                onPress={() => setRole('admin')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color={role === 'admin' ? COLORS.textPrimary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.roleToggleText,
                    role === 'admin' && styles.roleToggleTextActive,
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form with Glass Inputs */}
            <CustomInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder={role === 'admin' ? 'admin@asmart.com' : 'e.g. rahul@gmail.com'}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />

            {/* Olive Gradient Sign In Button */}
            <GradientButton
              title={
                loading
                  ? 'Signing In...'
                  : `Sign In as ${role === 'admin' ? 'Admin' : 'Customer'}`
              }
              onPress={handleSignIn}
              disabled={!isValid || loading}
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

            {/* Sign Up Link for Customers */}
            {role === 'customer' && (
              <TouchableOpacity
                style={styles.switchLink}
                onPress={() => navigation.replace('SignUp')}
                activeOpacity={0.7}
              >
                <Text style={styles.switchText}>
                  Don't have an account?{' '}
                  <Text style={styles.switchHighlight}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            )}
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
    paddingBottom: 32,
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
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 22,
    padding: 4,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  roleToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 18,
  },
  roleToggleBtnActive: {
    backgroundColor: COLORS.accentYellow,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  roleToggleText: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
  },
  roleToggleTextActive: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.bold,
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
