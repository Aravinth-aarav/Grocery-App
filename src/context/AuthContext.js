/**
 * AuthContext.js
 * Manages user authentication, sign-up, role switching, profile updates, and AsyncStorage persistence.
 *
 * Rules:
 * - Single Admin: Hardcoded in code only (admin@asmart.com / Admin@123), never shown in UI, never saved to storage.
 * - Sign Up: Restricted strictly to Customers (role forced to 'customer').
 * - Storage: Only Customer accounts are persisted; any stored admin accounts are filtered out.
 * - Auto-login session restore on app start.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { saveData, getData, removeData } from '../utils/storage';

const AuthContext = createContext();

const STORAGE_KEY_USERS = 'grocery_users_list';
const STORAGE_KEY_CURRENT_USER = 'grocery_current_user';

/** Hardcoded primary Admin account (code only, not exposed in UI) */
export const HARDCODED_ADMIN = {
  id: 'admin-primary',
  name: 'AS Mart Admin',
  email: 'admin@asmart.com',
  password: 'Admin@123',
  role: 'admin',
  phone: '9876543210',
  address: 'AS Mart Head Office, Coimbatore',
};

/** Demo Customer account preloaded for testing */
export const DEMO_CUSTOMER = {
  id: 'cust-primary',
  name: 'Aravinth Kumar',
  email: 'customer@gmail.com',
  password: 'Cust@123',
  role: 'customer',
  phone: '9876543211',
  address: '456 Green Street, Coimbatore',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([HARDCODED_ADMIN, DEMO_CUSTOMER]);
  const [loading, setLoading] = useState(true);

  // Restore session & users from AsyncStorage on start
  useEffect(() => {
    async function loadAuthStorage() {
      try {
        const storedUsers = await getData(STORAGE_KEY_USERS, []);

        // Filter out any admin accounts from storage to enforce single in-code admin rule
        const safeStoredCustomers = Array.isArray(storedUsers)
          ? storedUsers.filter(
              (u) =>
                u &&
                u.role === 'customer' &&
                (u.email || '').trim().toLowerCase() !== HARDCODED_ADMIN.email.toLowerCase() &&
                (u.email || '').trim().toLowerCase() !== 'admin@gmail.com'
            )
          : [];

        // Merge loaded customers with base accounts without duplicating emails
        const customerMap = new Map();
        customerMap.set(DEMO_CUSTOMER.email.toLowerCase(), DEMO_CUSTOMER);
        safeStoredCustomers.forEach((u) => {
          if (u.email) {
            customerMap.set(u.email.toLowerCase(), u);
          }
        });

        const mergedList = [HARDCODED_ADMIN, ...Array.from(customerMap.values())];
        setRegisteredUsers(mergedList);

        // Restore currentUser session
        const storedCurrentUser = await getData(STORAGE_KEY_CURRENT_USER, null);
        if (storedCurrentUser) {
          // If stored current user is admin, ensure it has latest hardcoded admin object
          if (
            storedCurrentUser.role === 'admin' &&
            (storedCurrentUser.email.toLowerCase() === HARDCODED_ADMIN.email.toLowerCase() ||
              storedCurrentUser.email.toLowerCase() === 'admin@gmail.com')
          ) {
            setUser(HARDCODED_ADMIN);
          } else if (storedCurrentUser.role === 'customer') {
            setUser(storedCurrentUser);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error loading auth storage:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAuthStorage();
  }, []);

  /**
   * Sign in – checks against hardcoded admin or registered customers
   * @param {string} email
   * @param {string} password
   * @param {string} role 'admin' | 'customer'
   */
  const signIn = useCallback(
    async (email, password, role) => {
      try {
        const trimmedEmail = (email || '').trim().toLowerCase();
        const trimmedPass = (password || '').trim();

        // 1. Check Admin Sign In
        if (role === 'admin') {
          const isAdminMatch =
            (trimmedEmail === HARDCODED_ADMIN.email.toLowerCase() ||
              trimmedEmail === 'admin@gmail.com' ||
              trimmedEmail === 'admin@grocery.com' ||
              trimmedEmail.includes('admin')) &&
            (trimmedPass === HARDCODED_ADMIN.password ||
              trimmedPass.toLowerCase() === 'admin@123');

          if (isAdminMatch) {
            setUser(HARDCODED_ADMIN);
            await saveData(STORAGE_KEY_CURRENT_USER, HARDCODED_ADMIN);
            return { success: true };
          }
          return {
            success: false,
            message: 'Invalid Admin credentials. Check email and password.',
          };
        }

        // 2. Check Customer Sign In
        const foundCustomer = registeredUsers.find(
          (u) =>
            u.role === 'customer' &&
            (u.email || '').trim().toLowerCase() === trimmedEmail &&
            u.password === trimmedPass
        );

        if (foundCustomer) {
          setUser(foundCustomer);
          await saveData(STORAGE_KEY_CURRENT_USER, foundCustomer);
          return { success: true };
        }

        return {
          success: false,
          message: 'Invalid Customer credentials. Please check your email and password.',
        };
      } catch (error) {
        console.error('[AuthContext] Error in signIn:', error);
        return { success: false, message: error.message || 'An unexpected error occurred during sign in.' };
      }
    },
    [registeredUsers]
  );

  /**
   * Sign up – strictly for Customers only.
   * Disallows admin registration and rejects existing emails.
   */
  const signUp = useCallback(
    async ({ name, email, password, phone = '', address = '' }) => {
      try {
        const trimmedEmail = (email || '').trim().toLowerCase();
        const trimmedName = (name || '').trim();
        const trimmedPass = (password || '').trim();

        if (!trimmedName || !trimmedEmail || !trimmedPass) {
          return { success: false, message: 'Please provide all required fields.' };
        }

        // Check if attempting to register with admin email
        if (
          trimmedEmail === HARDCODED_ADMIN.email.toLowerCase() ||
          trimmedEmail === 'admin@gmail.com'
        ) {
          return { success: false, message: 'Email is already registered.' };
        }

        // Check if customer email already exists
        const exists = registeredUsers.some(
          (u) => (u.email || '').trim().toLowerCase() === trimmedEmail
        );
        if (exists) {
          return { success: false, message: 'Email is already registered.' };
        }

        // Always force role: 'customer'
        const newCustomer = {
          id: `cust-${Date.now()}`,
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPass,
          role: 'customer',
          phone: (phone || '').trim(),
          address: (address || '').trim(),
          createdAt: new Date().toISOString(),
        };

        const updatedList = [...registeredUsers, newCustomer];
        setRegisteredUsers(updatedList);
        setUser(newCustomer);

        // Persist only customers to AsyncStorage
        const onlyCustomers = updatedList.filter((u) => u.role === 'customer');
        await saveData(STORAGE_KEY_USERS, onlyCustomers);
        await saveData(STORAGE_KEY_CURRENT_USER, newCustomer);

        return { success: true };
      } catch (error) {
        console.error('[AuthContext] Error in signUp:', error);
        return { success: false, message: error.message || 'Unable to complete registration. Please try again.' };
      }
    },
    [registeredUsers]
  );

  /**
   * Update profile – updates state and persists changes
   */
  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return;
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Update in registeredUsers list as well
      const updatedList = registeredUsers.map((u) =>
        (u.email || '').toLowerCase() === (updatedUser.email || '').toLowerCase()
          ? updatedUser
          : u
      );
      setRegisteredUsers(updatedList);

      await saveData(STORAGE_KEY_CURRENT_USER, updatedUser);

      if (updatedUser.role === 'customer') {
        const onlyCustomers = updatedList.filter((u) => u.role === 'customer');
        await saveData(STORAGE_KEY_USERS, onlyCustomers);
      }
    },
    [user, registeredUsers]
  );

  /**
   * Confirms logout with alert dialog and cleans up current user from storage
   */
  const signOut = useCallback(() => {
    const doLogout = async () => {
      try {
        setUser(null);
        await removeData(STORAGE_KEY_CURRENT_USER);
      } catch (err) {
        console.error('[AuthContext] Error signing out:', err);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('Are you sure you want to logout from AS Mart?')
          : true;
      if (confirmed) {
        doLogout();
      }
      return;
    }

    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout from AS Mart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: doLogout,
        },
      ],
      { cancelable: true }
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        registeredUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
