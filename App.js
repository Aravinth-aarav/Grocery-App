/**
 * App.js – Root component for the AS Mart Grocery App.
 * Wraps the entire app with Context Providers and the Navigator.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { AuthProvider } from './src/context/AuthContext';
import { ProductsProvider } from './src/context/ProductsContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { CartProvider } from './src/context/CartContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ProductsProvider>
            <FavoritesProvider>
              <CartProvider>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <AppNavigator />
              </CartProvider>
            </FavoritesProvider>
          </ProductsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
