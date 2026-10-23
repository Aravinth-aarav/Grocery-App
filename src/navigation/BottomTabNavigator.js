/**
 * BottomTabNavigator.js
 * Figma-styled floating yellow tab bar (#FFE11A):
 * - Floating rounded pill bar with soft shadow
 * - Tabs: Home, Favourite, My Cart (with red badge), Profile (Customer)
 * - Admin sees: Products, Cart
 * - Selected tab: small red top indicator, filled icon, bold text
 * - Cart tab badge with bounce animation
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProductsScreen from '../screens/ProductsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COLORS, FONTS } from '../theme';
import { scaleFont } from '../utils/responsive';

const Tab = createBottomTabNavigator();

/** Cart Badge with bounce animation */
function CartBadge({ count }) {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.35,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [count]);

  if (count === 0) return null;

  return (
    <Animated.View
      style={[
        styles.badge,
        { transform: [{ scale: bounceAnim }] },
      ]}
    >
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </Animated.View>
  );
}

export default function BottomTabNavigator() {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'fade', // Fade animation for tab switches
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: '#5E5D50',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          switch (route.name) {
            case 'ProductsTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'FavoritesTab':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'CartTab':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return (
            <View style={styles.iconContainer}>
              {/* Red indicator dot on top of active tab */}
              {focused ? (
                <View style={styles.redIndicator} />
              ) : (
                <View style={styles.indicatorPlaceholder} />
              )}

              <Ionicons
                name={iconName}
                size={22}
                color={focused ? COLORS.textPrimary : '#5E5D50'}
              />

              {route.name === 'CartTab' && <CartBadge count={totalItems} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="ProductsTab"
        component={ProductsScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      {!isAdmin && (
        <Tab.Screen
          name="FavoritesTab"
          component={FavoritesScreen}
          options={{
            tabBarLabel: 'Favourite',
          }}
        />
      )}
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          tabBarLabel: 'My Cart',
        }}
      />
      {!isAdmin && (
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Profile',
          }}
        />
      )}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 18,
    right: 18,
    backgroundColor: COLORS.accentYellow,
    borderRadius: 30,
    height: Platform.OS === 'ios' ? 70 : 64,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#1C1C1C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F0D400',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
  },
  redIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.tabIndicator,
    marginBottom: 4,
  },
  indicatorPlaceholder: {
    width: 6,
    height: 6,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: scaleFont(FONTS.tiny),
    fontWeight: FONTS.bold,
    marginTop: -2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.badge,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.accentYellow,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: scaleFont(9),
    fontWeight: FONTS.bold,
  },
});
