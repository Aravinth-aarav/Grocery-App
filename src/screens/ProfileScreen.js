/**
 * ProfileScreen.js
 * Figma-styled Profile Screen:
 * - GradientBackground (#D9F7B0 -> #FFF1CF)
 * - Header with RoundIconButton menu and logout
 * - Elevated user avatar with yellow accent circle
 * - Glass/cream info cards for details
 * - Order History shortcut card
 * - Edit Profile and Logout buttons
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import RoundIconButton from '../components/RoundIconButton';
import GradientButton from '../components/GradientButton';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import { scaleFont } from '../utils/responsive';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const infoItems = [
    { icon: 'person-outline', label: 'Full Name', value: user.name },
    { icon: 'mail-outline', label: 'Email Address', value: user.email },
    { icon: 'call-outline', label: 'Phone Number', value: user.phone || 'Not provided' },
    {
      icon: 'location-outline',
      label: 'Delivery Address',
      value: user.address || 'Not set yet',
    },
  ];

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <RoundIconButton
            name="menu-outline"
            size={24}
            onPress={() => navigation.openDrawer()}
          />

          <Text style={styles.headerTitle}>My Profile</Text>

          <RoundIconButton
            name="log-out-outline"
            size={20}
            color={COLORS.error}
            onPress={signOut}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={42} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {user.role === 'admin' ? '🛡 Store Admin' : '🛒 Customer'}
              </Text>
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.infoCard}>
            {infoItems.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.infoRow,
                  index === infoItems.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.infoIconCircle}>
                  <Ionicons name={item.icon} size={19} color={COLORS.accentOlive} />
                </View>
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Order History Card Shortcut */}
          <TouchableOpacity
            style={styles.historyCard}
            onPress={() => navigation.navigate('OrderHistory')}
            activeOpacity={0.8}
          >
            <View style={styles.historyCardLeft}>
              <View style={styles.historyIconCircle}>
                <Ionicons name="receipt-outline" size={20} color={COLORS.textPrimary} />
              </View>
              <View>
                <Text style={styles.historyTitle}>Order History & Receipts</Text>
                <Text style={styles.historySubtitle}>View past grocery purchases</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Edit Profile Olive Button */}
          <GradientButton
            title="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
            showTrailingChevrons={true}
            style={{ marginTop: 8 }}
          />

          {/* Red Logout Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={signOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
            <Text style={styles.logoutBtnText}>Logout from AS Mart</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: scaleFont(FONTS.h2),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 110,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: scaleFont(22),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  roleText: {
    fontSize: scaleFont(FONTS.tiny),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEBDC',
  },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(201, 183, 43, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  infoValue: {
    fontSize: scaleFont(FONTS.body),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyTitle: {
    fontSize: scaleFont(FONTS.body),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  historySubtitle: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF0F0',
    borderRadius: 22,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginTop: 14,
  },
  logoutBtnText: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.bold,
    color: COLORS.error,
  },
});
