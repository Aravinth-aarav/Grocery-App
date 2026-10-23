/**
 * WelcomeScreen.js
 * Figma-styled Welcome landing screen:
 * - Full-screen gradient (#D9F7B0 -> #FFF1CF)
 * - Large fruit hero image in a soft cream rounded card with fade + scale in animation
 * - AS Mart logo
 * - 3 pagination dots
 * - Tagline: "The easiest way to buy your grocery shopping"
 * - "Get Started" olive gradient button with gentle pulse loop
 * - Sign In & Sign Up options with role selection (Customer / Admin)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import GradientButton from '../components/GradientButton';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import { scaleFont } from '../utils/responsive';

export default function WelcomeScreen({ navigation }) {
  const { user } = useAuth();
  const [role, setRole] = useState('customer'); // 'customer' | 'admin'

  // Animations
  const heroScale = useRef(new Animated.Value(0.88)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(25)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Hero entrance: fade + scale in
    Animated.parallel([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 6,
        tension: 45,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 650,
        delay: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(contentSlide, {
        toValue: 0,
        friction: 8,
        tension: 50,
        delay: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // 2. Continuous gentle pulse for "Get Started" button
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.035,
          duration: 1100,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      // User is already logged in
      navigation.navigate('Main');
    } else {
      navigation.navigate('SignIn', { role });
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#D9F7B0" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Fruit Card */}
          <Animated.View
            style={[
              styles.heroCard,
              {
                opacity: heroOpacity,
                transform: [{ scale: heroScale }],
              },
            ]}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&auto=format&fit=crop&q=80',
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            {/* Subtle gloss overlay */}
            <View style={styles.heroOverlay} />
          </Animated.View>

          {/* Logo & Headline */}
          <Animated.View
            style={[
              styles.infoSection,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentSlide }],
              },
            ]}
          >
            <Logo size="large" layout="vertical" showTagline={false} />

            {/* Pagination dots bar (like Figma) */}
            <View style={styles.dotsBar}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            {/* Figma Tagline */}
            <Text style={styles.mainHeadline}>
              The easiest way to buy{'\n'}your grocery shopping
            </Text>

            <Text style={styles.subHeadline}>
              Fresh farm vegetables, seasonal fruits, dairy & daily kitchen essentials delivered in minutes.
            </Text>

            {/* Role Selector */}
            <View style={styles.roleWrapper}>
              <Text style={styles.roleLabel}>Select login role:</Text>
              <View style={styles.roleToggle}>
                <TouchableOpacity
                  style={[styles.roleBtn, role === 'customer' && styles.roleBtnActive]}
                  onPress={() => setRole('customer')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="person"
                    size={15}
                    color={role === 'customer' ? COLORS.textPrimary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleBtnText,
                      role === 'customer' && styles.roleBtnTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleBtn, role === 'admin' && styles.roleBtnActive]}
                  onPress={() => setRole('admin')}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={15}
                    color={role === 'admin' ? COLORS.textPrimary : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleBtnText,
                      role === 'admin' && styles.roleBtnTextActive,
                    ]}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Get Started Button with Gentle Pulse Loop */}
            <Animated.View
              style={[
                styles.pulseWrapper,
                { transform: [{ scale: pulseScale }] },
              ]}
            >
              <GradientButton
                title="Get Started"
                onPress={handleGetStarted}
                showTrailingChevrons={true}
                style={styles.getStartedBtn}
              />
            </Animated.View>

            {/* Direct Sign In & Sign Up Options */}
            <View style={styles.authLinksRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignIn', { role })}
                style={styles.authLinkButton}
                activeOpacity={0.7}
              >
                <Text style={styles.authLinkText}>
                  Sign In <Text style={styles.roleTag}>({role})</Text>
                </Text>
              </TouchableOpacity>

              <View style={styles.linkDivider} />

              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                style={styles.authLinkButton}
                activeOpacity={0.7}
              >
                <Text style={styles.authLinkText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 30,
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    height: 250,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(217, 247, 176, 0.12)',
  },
  infoSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  dotsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5C5B9',
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.accentYellow,
  },
  mainHeadline: {
    fontSize: scaleFont(24),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 4,
    marginBottom: 8,
  },
  subHeadline: {
    fontSize: scaleFont(FONTS.small),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  roleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: FONTS.medium,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 22,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  roleBtnActive: {
    backgroundColor: COLORS.accentYellow,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  roleBtnText: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
  },
  roleBtnTextActive: {
    color: COLORS.textPrimary,
    fontWeight: FONTS.bold,
  },
  pulseWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  getStartedBtn: {
    width: '100%',
  },
  authLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  authLinkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  authLinkText: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textPrimary,
    fontWeight: FONTS.semiBold,
  },
  roleTag: {
    color: COLORS.accentOlive,
    fontWeight: FONTS.bold,
    textTransform: 'capitalize',
  },
  linkDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.divider,
    marginHorizontal: 8,
  },
});
