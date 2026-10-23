/**
 * AppNavigator – Root Stack Navigator for AS Mart.
 * Auth flow: Welcome → SignIn / SignUp
 * Main flow: Drawer (wrapping BottomTabs) + ProductDetails, EditProfile as stack screens.
 * Features AS Mart logo splash loader waiting on auth, products, and cart contexts.
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import Logo from '../components/Logo';
import { COLORS, FONTS } from '../theme';

// Auth screens
import WelcomeScreen from '../screens/WelcomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Main app (Drawer > BottomTabs)
import DrawerNavigator from './DrawerNavigator';

// Stack-only screens
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { loading: productsLoading } = useProducts();
  const { loading: cartLoading } = useCart();

  const isAppLoading = authLoading || productsLoading || cartLoading;

  if (isAppLoading) {
    return (
      <View style={styles.splashContainer}>
        <Logo size="large" layout="vertical" />
        <Text style={styles.splashSubtitle}>Loading your daily groceries...</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right', // Slide from right for stack screens
        }}
      >
        {user ? (
          /* === Authenticated: Drawer + Details + Profile Edit === */
          <>
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen
              name="ProductDetails"
              component={ProductDetailsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="OrderHistory"
              component={OrderHistoryScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          /* === Unauthenticated / Guest Auth Flow === */
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  splashSubtitle: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
