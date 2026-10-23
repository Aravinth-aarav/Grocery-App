/**
 * FavoritesContext.js
 * Manages customer's wishlist with per-user AsyncStorage persistence.
 * Uses a clean useEffect to automatically persist whenever the favorites array updates.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { saveData, getData } from '../utils/storage';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]); // array of product IDs
  const [loading, setLoading] = useState(true);
  const isLoadedRef = useRef(false);

  // Storage key is dynamic per logged-in user email
  const userKey = user?.email
    ? `grocery_favorites_${user.email.toLowerCase()}`
    : 'grocery_favorites_guest';

  // 1. Load favorites whenever user session changes
  useEffect(() => {
    let isCancelled = false;
    async function loadFavorites() {
      setLoading(true);
      isLoadedRef.current = false;
      try {
        const stored = await getData(userKey, []);
        if (!isCancelled) {
          setFavorites(Array.isArray(stored) ? stored : []);
        }
      } catch (err) {
        console.error('[FavoritesContext] Error loading favorites:', err);
        if (!isCancelled) setFavorites([]);
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setTimeout(() => {
            isLoadedRef.current = true;
          }, 50);
        }
      }
    }

    loadFavorites();

    return () => {
      isCancelled = true;
    };
  }, [userKey]);

  // 2. Automatically save favorites via useEffect whenever state changes
  useEffect(() => {
    if (isLoadedRef.current) {
      saveData(userKey, favorites);
    }
  }, [favorites, userKey]);

  /** Toggle a product in/out of favorites */
  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  /** Check if a product is in favorites */
  const isFavorite = useCallback(
    (productId) => favorites.includes(productId),
    [favorites]
  );

  /** Remove a single product from favorites */
  const removeFavorite = useCallback((productId) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  }, []);

  /** Clear all favorites */
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        toggleFavorite,
        isFavorite,
        removeFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context)
    throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}

export default FavoritesContext;
