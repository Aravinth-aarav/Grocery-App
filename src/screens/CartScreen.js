/**
 * CartScreen.js
 * Figma-styled My Cart screen:
 * - GradientBackground (#D9F7B0 -> #FFF1CF)
 * - Header with RoundIconButton Back and Search
 * - List of CartItems with product thumbnail, category, ₹ price/kg, and vertical yellow +/- stepper
 * - Total Amount display
 * - Full-width "Book Now ›››" olive gradient button with order placed alert and cart clear
 * - Animated empty cart state with floating icon
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import RoundIconButton from '../components/RoundIconButton';
import CartItem from '../components/CartItem';
import GradientButton from '../components/GradientButton';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { COLORS, FONTS } from '../theme';
import { formatPrice } from '../utils/format';
import { scaleFont } from '../utils/responsive';

export default function CartScreen({ navigation }) {
  const { products } = useProducts();
  const {
    cartItems,
    increaseQty,
    decreaseQty,
    removeFromCart,
    checkoutOrder,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  // Floating animation for empty cart icon
  const floatAnim = useRef(new Animated.Value(0)).current;
  // Total amount number animation when it changes
  const totalScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(totalScaleAnim, {
        toValue: 1.15,
        duration: 130,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(totalScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [total]);

  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, []);

  const handleBookNow = () => {
    const newOrder = checkoutOrder();
    if (!newOrder) return;
    Alert.alert(
      'Order Placed! 🎉',
      `Your grocery order #${newOrder.id} of ${formatPrice(newOrder.total)} has been placed successfully.\nThank you for shopping with AS Mart!`,
      [
        {
          text: 'View History',
          onPress: () => navigation.navigate('OrderHistory'),
        },
        { text: 'OK' },
      ]
    );
  };

  const renderCartItem = ({ item, index }) => {
    const product = products.find((p) => p.id === item.productId);
    return (
      <CartItem
        product={product}
        quantity={item.quantity}
        index={index}
        onIncrease={() => increaseQty(item.productId)}
        onDecrease={() => decreaseQty(item.productId)}
        onRemove={() => removeFromCart(item.productId)}
      />
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header with Back and Search Buttons */}
        <View style={styles.header}>
          <RoundIconButton
            name="chevron-back"
            size={24}
            onPress={() => navigation.goBack()}
          />

          <Text style={styles.headerTitle}>My Cart</Text>

          <RoundIconButton
            name="search-outline"
            size={22}
            onPress={() => navigation.navigate('ProductsTab')}
          />
        </View>

        {cartItems.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <Animated.View
              style={[
                styles.emptyIconCircle,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <Ionicons name="cart-outline" size={60} color={COLORS.accentOlive} />
            </Animated.View>
            <Text style={styles.emptyText}>Your cart is empty</Text>
            <Text style={styles.emptySubtext}>
              Explore our farm-fresh produce and add daily essentials to your cart.
            </Text>
            <GradientButton
              title="Shop Groceries"
              onPress={() => navigation.navigate('ProductsTab')}
              style={{ marginTop: 24, paddingHorizontal: 32 }}
            />
          </View>
        ) : (
          <>
            {/* Cart Items List */}
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.productId}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Bottom Summary & Book Now Bar */}
            <View style={styles.bottomCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    deliveryFee === 0 && styles.freeBadge,
                  ]}
                >
                  {deliveryFee === 0
                    ? 'FREE (Above ₹500)'
                    : formatPrice(deliveryFee)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalSub}>Inclusive of all taxes</Text>
                </View>
                <Animated.Text
                  style={[
                    styles.totalValue,
                    { transform: [{ scale: totalScaleAnim }] },
                  ]}
                >
                  {formatPrice(total)}
                </Animated.Text>
              </View>

              <GradientButton
                title="Book Now"
                onPress={handleBookNow}
                showTrailingChevrons={true}
                style={styles.bookNowBtn}
              />
            </View>
          </>
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
    paddingTop: 8,
    paddingBottom: 220, // Accommodate bottom summary card
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accentOlive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyText: {
    fontSize: scaleFont(22),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 18,
  },
  emptySubtext: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'ios' ? 26 : 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEBDC',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: scaleFont(FONTS.small),
    color: COLORS.textSecondary,
    fontWeight: FONTS.medium,
  },
  summaryValue: {
    fontSize: scaleFont(FONTS.small),
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  freeBadge: {
    color: COLORS.success,
    fontWeight: FONTS.bold,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEBDC',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: scaleFont(FONTS.h3),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalSub: {
    fontSize: scaleFont(FONTS.tiny),
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: scaleFont(22),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  bookNowBtn: {
    width: '100%',
  },
});
