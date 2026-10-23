/**
 * DrawerNavigator.js
 * Figma-styled Navigation Drawer:
 * - Gradient header (#D9F7B0 -> #FFF1CF) with AS Mart logo
 * - User avatar circle, username, and role badge (Admin / Customer)
 * - Rounded elevated menu items
 * - Red Logout item in menu and footer
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomTabNavigator from './BottomTabNavigator';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import { scaleFont } from '../utils/responsive';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#FCFAF2' }}>
      {/* Brand & User Info Header with Gradient */}
      <LinearGradient
        colors={['#D9F7B0', '#FFF1CF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.drawerHeader}
      >
        <Logo
          size="small"
          layout="horizontal"
          textColor={COLORS.textPrimary}
          taglineColor={COLORS.textSecondary}
          style={{ marginBottom: 14 }}
        />

        <View style={styles.userInfoRow}>
          <View style={styles.avatarCircle}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={24}
              color={COLORS.textPrimary}
            />
          </View>
          <View style={styles.userTextWrapper}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || (isAdmin ? 'AS Mart Admin' : 'Customer')}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.userRole}>
                {isAdmin ? '🛡 Store Admin' : '🛒 Customer Account'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Drawer Menu Items */}
      <View style={styles.drawerBody}>
        <DrawerItem
          label="Home & Catalog"
          icon={({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={COLORS.accentOlive} />
          )}
          onPress={() => props.navigation.navigate('MainTabs', { screen: 'ProductsTab' })}
          labelStyle={styles.drawerLabel}
          style={styles.roundedItem}
        />

        {!isAdmin && (
          <DrawerItem
            label="Favourites"
            icon={({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={COLORS.accentOlive} />
            )}
            onPress={() => props.navigation.navigate('MainTabs', { screen: 'FavoritesTab' })}
            labelStyle={styles.drawerLabel}
            style={styles.roundedItem}
          />
        )}

        <DrawerItem
          label="My Cart"
          icon={({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={COLORS.accentOlive} />
          )}
          onPress={() => props.navigation.navigate('MainTabs', { screen: 'CartTab' })}
          labelStyle={styles.drawerLabel}
          style={styles.roundedItem}
        />

        {!isAdmin && (
          <DrawerItem
            label="Profile"
            icon={({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={COLORS.accentOlive} />
            )}
            onPress={() => props.navigation.navigate('MainTabs', { screen: 'ProfileTab' })}
            labelStyle={styles.drawerLabel}
            style={styles.roundedItem}
          />
        )}

        <DrawerItem
          label={isAdmin ? 'Store Orders' : 'My Orders'}
          icon={({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={COLORS.accentOlive} />
          )}
          onPress={() => props.navigation.navigate('OrderHistory')}
          labelStyle={styles.drawerLabel}
          style={styles.roundedItem}
        />

        {/* Dedicated Red Logout item in Drawer menu */}
        <DrawerItem
          label="Logout"
          icon={({ size }) => (
            <Ionicons name="log-out-outline" size={size} color={COLORS.error} />
          )}
          onPress={signOut}
          labelStyle={[styles.drawerLabel, { color: COLORS.error, fontWeight: 'bold' }]}
          style={[styles.roundedItem, styles.logoutItem]}
        />
      </View>

      {/* Drawer Footer with styled Logout Button */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity
          style={styles.footerLogoutBtn}
          onPress={signOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={18} color={COLORS.error} />
          <Text style={styles.footerLogoutText}>Sign Out of AS Mart</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(320, Math.round(width * 0.78));

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: '#FCFAF2',
          width: drawerWidth,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={BottomTabNavigator} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    paddingTop: 36,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEBDC',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userTextWrapper: {
    flex: 1,
  },
  userName: {
    fontSize: scaleFont(FONTS.h3),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  userRole: {
    fontSize: scaleFont(FONTS.tiny),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  drawerBody: {
    flex: 1,
    paddingTop: 6,
    paddingHorizontal: 8,
  },
  roundedItem: {
    borderRadius: 14,
    marginVertical: 3,
  },
  logoutItem: {
    backgroundColor: COLORS.errorLight,
    marginTop: 12,
  },
  drawerLabel: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginLeft: -8,
  },
  drawerFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EFEBDC',
    padding: 16,
    paddingBottom: 24,
  },
  footerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  footerLogoutText: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.bold,
    color: COLORS.error,
    marginLeft: 8,
  },
});
