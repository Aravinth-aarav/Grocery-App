/**
 * OrderHistoryScreen.js
 * Figma-styled Order History:
 * - GradientBackground (#D9F7B0 -> #FFF1CF)
 * - RoundIconButton back and logout
 * - Cream cards with 20px radius and soft shadow
 * - Full list of purchased items, quantities, and ₹ totals
 * - Order again action
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import RoundIconButton from '../components/RoundIconButton';
import GradientButton from '../components/GradientButton';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../theme';
import { formatPrice } from '../utils/format';
import { scaleFont } from '../utils/responsive';

export default function OrderHistoryScreen({ navigation }) {
  const { orders, addToCart } = useCart();
  const { signOut } = useAuth();

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addToCart(item.id, item.quantity);
    });
    Alert.alert(
      'Items Added to Cart! 🛒',
      `All ${order.items.length} items from ${order.id} have been re-added to your cart.`,
      [
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('Main', { screen: 'CartTab' }),
        },
        { text: 'Continue' },
      ]
    );
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      {/* Top row: Order ID & Status Badge */}
      <View style={styles.orderHeaderRow}>
        <View style={styles.orderIdBadge}>
          <Ionicons name="receipt-outline" size={16} color={COLORS.accentOlive} />
          <Text style={styles.orderIdText}>{item.id}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
          <Text style={styles.statusText}>{item.status || 'Delivered'}</Text>
        </View>
      </View>

      {/* Date row */}
      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.divider} />

      {/* Items List */}
      <View style={styles.itemsContainer}>
        {item.items.map((prod, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemQuantity}>{prod.quantity}x</Text>
            <View style={{ flex: 1, paddingHorizontal: 8 }}>
              <Text style={styles.itemName} numberOfLines={1}>
                {prod.name}
              </Text>
              <Text style={styles.itemWeight}>{prod.weight}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {formatPrice(prod.price * prod.quantity)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      {/* Order Total & Reorder Button */}
      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.totalLabel}>
            Total Paid ({item.deliveryFee === 0 ? 'Free Delivery' : `+₹${item.deliveryFee} Del.`}):
          </Text>
          <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.reorderBtn}
          onPress={() => handleReorder(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="repeat" size={15} color={COLORS.textPrimary} />
          <Text style={styles.reorderText}>Reorder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <RoundIconButton
            name="chevron-back"
            size={24}
            onPress={() => navigation.goBack()}
          />

          <Text style={styles.headerTitle}>Order History</Text>

          <RoundIconButton
            name="log-out-outline"
            size={20}
            color={COLORS.error}
            onPress={signOut}
          />
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={54} color={COLORS.accentOlive} />
            </View>
            <Text style={styles.emptyTitle}>No Order History Yet</Text>
            <Text style={styles.emptySubtitle}>
              When you place an order from AS Mart, receipts and items will appear here.
            </Text>
            <GradientButton
              title="Browse Produce"
              onPress={() => navigation.navigate('Main', { screen: 'ProductsTab' })}
              style={{ marginTop: 24, paddingHorizontal: 32 }}
            />
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 36,
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: scaleFont(FONTS.body),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: scaleFont(FONTS.tiny),
    fontWeight: FONTS.bold,
    color: COLORS.success,
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEBDC',
    marginVertical: 8,
  },
  itemsContainer: {
    marginVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemQuantity: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.bold,
    color: COLORS.accentOlive,
    width: 24,
  },
  itemName: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.medium,
    color: COLORS.textPrimary,
  },
  itemWeight: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textHint,
  },
  itemPrice: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: scaleFont(FONTS.h3),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentYellow,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  reorderText: {
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.accentOlive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: scaleFont(FONTS.h2),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
