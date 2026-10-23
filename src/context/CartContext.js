/**
 * CartContext.js
 * Manages the shopping cart and order purchase history with per-user AsyncStorage persistence.
 * Uses dedicated useEffect hooks to cleanly persist cart items and orders.
 * Delivery rule: Free delivery strictly above ₹500 (subtotal > 500), otherwise ₹40.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductsContext';
import { saveData, getData } from '../utils/storage';

const CartContext = createContext();

/** Default sample orders to showcase history immediately */
const SAMPLE_ORDERS = [
  {
    id: 'ORD-9842',
    date: '21 Oct 2026, 04:30 PM',
    status: 'Delivered',
    items: [
      { id: 'prod-32', name: 'Daawat Rozana Basmati Rice', price: 120, quantity: 2, weight: '1 kg bag' },
      { id: 'prod-33', name: 'Desi Toor Dal (Arhar Dal)', price: 150, quantity: 1, weight: '1 kg bag' },
      { id: 'prod-38', name: 'Refined Sunflower Cooking Oil', price: 140, quantity: 1, weight: '1 Litre pouch' },
    ],
    subtotal: 530,
    deliveryFee: 0,
    total: 530,
  },
  {
    id: 'ORD-7615',
    date: '18 Oct 2026, 10:15 AM',
    status: 'Delivered',
    items: [
      { id: 'prod-14', name: 'Fresh Paneer (Cottage Cheese)', price: 90, quantity: 2, weight: '200 g pack' },
      { id: 'prod-15', name: 'Fresh Curd / Dahi (Pouch)', price: 40, quantity: 2, weight: '500 g' },
      { id: 'prod-1', name: 'Fresh Bananas (Robusta)', price: 45, quantity: 1, weight: '1 kg' },
    ],
    subtotal: 305,
    deliveryFee: 40,
    total: 345,
  },
];

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { products } = useProducts();
  const [cartItems, setCartItems] = useState([]); // [{ productId, quantity }]
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoadedRef = useRef(false);
  const isOrdersLoadedRef = useRef(false);

  // Dynamic user key so carts and orders are isolated per account
  const userKey = user?.email
    ? `grocery_cart_${user.email.toLowerCase()}`
    : 'grocery_cart_guest';

  const ordersKey = user?.email
    ? `grocery_orders_${user.email.toLowerCase()}`
    : 'grocery_orders_guest';

  // 1. Load cart and order history on user change or app start
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setLoading(true);
      isLoadedRef.current = false;
      isOrdersLoadedRef.current = false;
      try {
        const storedCart = await getData(userKey, []);
        if (!isCancelled) {
          setCartItems(Array.isArray(storedCart) ? storedCart : []);
        }

        const storedOrders = await getData(ordersKey, null);
        if (!isCancelled) {
          if (Array.isArray(storedOrders) && storedOrders.length > 0) {
            setOrders(storedOrders);
          } else {
            // Seed sample orders for user experience
            setOrders(SAMPLE_ORDERS);
            await saveData(ordersKey, SAMPLE_ORDERS);
          }
        }
      } catch (err) {
        console.error('[CartContext] Error loading cart/orders:', err);
        if (!isCancelled) {
          setCartItems([]);
          setOrders(SAMPLE_ORDERS);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setTimeout(() => {
            isLoadedRef.current = true;
            isOrdersLoadedRef.current = true;
          }, 50);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [userKey, ordersKey]);

  // 2. Automatically persist whenever cartItems changes
  useEffect(() => {
    if (isLoadedRef.current) {
      saveData(userKey, cartItems);
    }
  }, [cartItems, userKey]);

  // 3. Automatically persist whenever orders changes
  useEffect(() => {
    if (isOrdersLoadedRef.current) {
      saveData(ordersKey, orders);
    }
  }, [orders, ordersKey]);

  /** Add a product to cart (or increment qty) */
  const addToCart = useCallback((productId, addQuantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + addQuantity }
            : item
        );
      }
      return [...prev, { productId, quantity: addQuantity }];
    });
  }, []);

  /** Remove a product from cart entirely */
  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  /** Increase quantity by 1 */
  const increaseQty = useCallback((productId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }, []);

  /** Decrease quantity by 1; remove if qty reaches 0 */
  const decreaseQty = useCallback((productId) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  /** Clear entire cart */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /** Total number of items (sum of quantities) */
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  /** Subtotal price in ₹ */
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }, [cartItems, products]);

  /**
   * Delivery fee: Free delivery strictly above ₹500 (subtotal > 500), otherwise ₹40
   */
  const deliveryFee = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return subtotal > 500 ? 0 : 40;
  }, [subtotal, cartItems]);

  /** Grand total */
  const total = useMemo(() => {
    if (cartItems.length === 0) return 0;
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee, cartItems]);

  /** Checkout: records order to history and clears cart */
  const checkoutOrder = useCallback(() => {
    if (cartItems.length === 0) return null;

    const detailedItems = cartItems.map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return {
        id: item.productId,
        name: p?.name || 'Grocery Product',
        price: p?.price || 0,
        weight: p?.weight || '1 unit',
        quantity: item.quantity,
        image: p?.image || '',
      };
    });

    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString('en-IN', {
      month: 'short',
    })} ${now.getFullYear()}, ${now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const newOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: formattedDate,
      status: 'Delivered',
      items: detailedItems,
      subtotal,
      deliveryFee,
      total,
      userEmail: user?.email || '',
      userName: user?.name || '',
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  }, [cartItems, products, subtotal, deliveryFee, total, user, clearCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        loading,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        checkoutOrder,
        cartCount,
        totalItems: cartCount,
        subtotal,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export default CartContext;
