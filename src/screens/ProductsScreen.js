/**
 * ProductsScreen.js
 * Figma-styled Daily Grocery Food screen:
 * - Full-screen gradient (#D9F7B0 -> #FFF1CF) via GradientBackground
 * - Top header with drawer menu button and cart/receipt shortcuts
 * - Large two-line bold title on the left ("Daily Grocery\nFood")
 *   and round search icon on the right (44x44)
 * - Tapping search icon expands an animated search bar with a smooth width animation
 * - Horizontally scrolling pill chips (selected = yellow #FFE11A, inactive = grey #B9B9AE)
 * - Dynamic category headline: "Found more fruits!" (or "Found more [category]!")
 * - Staggered 2-column grid with column 2 offset down (like Figma)
 * - Cream cards with image, name, ₹ price/kg, heart pop, yellow add-to-cart
 * - Admin Add/Edit modal and floating action button
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientBackground from '../components/GradientBackground';
import ProductCard from '../components/ProductCard';
import CategoryChip from '../components/CategoryChip';
import RoundIconButton from '../components/RoundIconButton';
import GradientButton from '../components/GradientButton';
import CustomInput from '../components/CustomInput';
import { useProducts } from '../context/ProductsContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/products';
import { COLORS, FONTS } from '../theme';
import { getGridColumns, getCardWidth, scaleFont } from '../utils/responsive';
import { formatPrice } from '../utils/format';

export default function ProductsScreen({ navigation }) {
  const { user } = useAuth();
  const { products, addProduct, editProduct, deleteProduct, refreshProducts } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, totalItems } = useCart();
  const { width } = useWindowDimensions();

  const isAdmin = user?.role === 'admin';
  const numColumns = getGridColumns(width);
  const cardWidth = getCardWidth(width, 32, 14);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Search expand width animation (0 -> 1)
  const searchWidthAnim = useRef(new Animated.Value(0)).current;

  // Admin Modal form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Fruits');
  const [formPrice, setFormPrice] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  const openSearch = () => {
    setIsSearchOpen(true);
    Animated.spring(searchWidthAnim, {
      toValue: 1,
      friction: 8,
      tension: 65,
      useNativeDriver: false,
    }).start();
  };

  const closeSearch = () => {
    Animated.timing(searchWidthAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      setIsSearchOpen(false);
      setSearch('');
    });
  };

  /** Filtered products list */
  const filteredProducts = useMemo(() => {
    let list = products || [];
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedCategory, search]);

  /** Dynamic section subtitle */
  const dynamicCategoryTitle = useMemo(() => {
    if (search.trim()) {
      return `Results for "${search}" (${filteredProducts.length})`;
    }
    if (selectedCategory === 'All') {
      return `Found ${filteredProducts.length} fresh groceries!`;
    }
    return `Found more ${selectedCategory.toLowerCase()}!`;
  }, [selectedCategory, search, filteredProducts.length]);

  /** Pull to refresh */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshProducts) {
      await refreshProducts();
    }
    setRefreshing(false);
  }, [refreshProducts]);

  /** Admin Modal triggers */
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormCategory(product.category);
      setFormPrice(String(product.price));
      setFormWeight(product.weight);
      setFormDescription(product.description || '');
      setFormImage(product.image || '');
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormCategory('Fruits');
      setFormPrice('');
      setFormWeight('');
      setFormDescription('');
      setFormImage('');
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    if (!formName.trim() || !formCategory.trim() || !formPrice.trim()) {
      Alert.alert('Required Fields', 'Please enter product name, category, and price.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price in ₹.');
      return;
    }

    const data = {
      name: formName.trim(),
      category: formCategory.trim(),
      price: priceNum,
      weight: formWeight.trim() || '1 kg',
      description: formDescription.trim() || 'Fresh and high quality grocery item from AS Mart.',
      image:
        formImage.trim() ||
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop',
    };

    if (editingProduct) {
      editProduct(editingProduct.id, data);
      Alert.alert('Success', `${data.name} updated successfully!`);
    } else {
      addProduct(data);
      Alert.alert('Success', `${data.name} added to catalog!`);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product from AS Mart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteProduct(id),
      },
    ]);
  };

  const handleAddToCart = (product) => {
    addToCart(product.id, 1);
  };

  const renderProduct = ({ item, index }) => {
    // In Figma staggered 2-column layout: second column items are offset down
    const isSecondCol = numColumns === 2 && index % 2 === 1;

    return (
      <View style={[isSecondCol && styles.staggerOffset]}>
        <ProductCard
          product={item}
          index={index}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={toggleFavorite}
          onAddToCart={() => handleAddToCart(item)}
          onPress={() => {
            if (!isAdmin) {
              navigation.navigate('ProductDetails', { productId: item.id });
            }
          }}
          isAdmin={isAdmin}
          onEdit={openModal}
          onDelete={handleDelete}
          cardWidth={cardWidth}
        />
      </View>
    );
  };

  // Interpolated animated search bar width (from 44 to full available width)
  const animatedSearchWidth = searchWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [44, width - 36],
  });

  const searchInputOpacity = searchWidthAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.2, 1],
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Top App Bar with Drawer Toggle & Header Actions */}
        <View style={styles.topBar}>
          <RoundIconButton
            name="menu-outline"
            onPress={() => navigation.openDrawer()}
          />

          <View style={styles.topRightActions}>
            {!isAdmin && (
              <RoundIconButton
                name="cart-outline"
                badgeCount={totalItems}
                onPress={() => navigation.navigate('Cart')}
                style={{ marginRight: 8 }}
              />
            )}

            <RoundIconButton
              name="receipt-outline"
              onPress={() => navigation.navigate('OrderHistory')}
            />
          </View>
        </View>

        {/* Title Section with Large Two-Line Title & Animated Expandable Search Icon */}
        <View style={styles.titleAndSearchContainer}>
          {/* Large Two-Line Bold Title on Left (hidden or faded when search is fully open) */}
          {!isSearchOpen && (
            <View style={styles.titleWrapper}>
              <Text style={styles.mainTitle}>Daily Grocery{'\n'}Food</Text>
            </View>
          )}

          {/* Animated Search Bar that expands from Round Search Icon */}
          <Animated.View
            style={[
              styles.expandableSearchBox,
              { width: animatedSearchWidth },
              isSearchOpen && styles.expandableSearchBoxActive,
            ]}
          >
            {isSearchOpen ? (
              <View style={styles.searchInnerActive}>
                <Ionicons name="search" size={20} color={COLORS.accentOlive} />
                <Animated.View style={{ flex: 1, opacity: searchInputOpacity }}>
                  <TextInput
                    style={styles.activeSearchInput}
                    placeholder="Search 40+ fresh groceries..."
                    placeholderTextColor={COLORS.textHint}
                    value={search}
                    onChangeText={setSearch}
                    autoFocus
                  />
                </Animated.View>
                {search.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearch('')}
                    style={{ padding: 4, marginRight: 2 }}
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.textHint} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={closeSearch}
                  style={styles.closeSearchBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={openSearch}
                style={styles.searchIconBtn}
                activeOpacity={0.85}
              >
                <Ionicons name="search-outline" size={22} color={COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </Animated.View>
        </View>

        {/* Horizontally Scrolling Category Chips */}
        <View style={styles.chipsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Dynamic Category Text ("Found more fruits!") */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{dynamicCategoryTitle}</Text>
          {selectedCategory !== 'All' && (
            <TouchableOpacity onPress={() => setSelectedCategory('All')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Staggered 2-Column Grid (second column offset down like Figma) */}
        <FlatList
          key={`staggered-grid-${numColumns}-${selectedCategory}`}
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.accentOlive]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCircle}>
                <Ionicons name="basket-outline" size={48} color={COLORS.accentOlive} />
              </View>
              <Text style={styles.emptyText}>No groceries found</Text>
              <Text style={styles.emptySubtext}>
                We couldn't find items matching "{search}". Try searching for apples, milk, or fresh vegetables.
              </Text>
            </View>
          }
        />

        {/* Admin Floating Action Button */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminFab}
            onPress={() => openModal()}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color={COLORS.white} />
            <Text style={styles.adminFabText}>Add Item</Text>
          </TouchableOpacity>
        )}

        {/* Admin Add / Edit Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalContent}
            >
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingProduct ? 'Edit Grocery Item' : 'Add New Grocery to AS Mart'}
                  </Text>
                  <RoundIconButton
                    name="close"
                    size={20}
                    onPress={closeModal}
                  />
                </View>

                <CustomInput
                  label="Product Name *"
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g. Royal Gala Red Apple"
                  autoCapitalize="words"
                />

                <Text style={styles.fieldLabel}>Category *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: 14 }}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <CategoryChip
                      key={c}
                      label={c}
                      selected={formCategory === c}
                      onPress={() => setFormCategory(c)}
                    />
                  ))}
                </ScrollView>

                <CustomInput
                  label="Price in ₹ *"
                  value={formPrice}
                  onChangeText={setFormPrice}
                  placeholder="e.g. 180"
                  keyboardType="numeric"
                />

                <CustomInput
                  label="Weight / Unit *"
                  value={formWeight}
                  onChangeText={setFormWeight}
                  placeholder="e.g. 1 kg, 500 g, 1 Litre"
                />

                <CustomInput
                  label="Description"
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Farm-fresh, crisp, and nutrient-rich..."
                />

                <CustomInput
                  label="Image URL"
                  value={formImage}
                  onChangeText={setFormImage}
                  placeholder="https://images.unsplash.com/..."
                />

                <GradientButton
                  title={editingProduct ? 'Save Changes' : 'Add to Catalog'}
                  onPress={handleSave}
                  style={{ marginTop: 8, marginBottom: 24 }}
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 4,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleAndSearchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 12,
    minHeight: 68,
  },
  titleWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: scaleFont(30),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  expandableSearchBox: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFEBDC',
    shadowColor: '#1C1C1C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandableSearchBoxActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: COLORS.primaryLight,
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInnerActive: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  activeSearchInput: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textPrimary,
    marginLeft: 8,
    paddingVertical: 0,
  },
  closeSearchBtn: {
    padding: 4,
    marginLeft: 4,
  },
  chipsRow: {
    marginBottom: 10,
  },
  chipsContent: {
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: scaleFont(FONTS.h3),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: scaleFont(FONTS.small),
    fontWeight: FONTS.semiBold,
    color: COLORS.accentOlive,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  staggerOffset: {
    marginTop: 24, // Figma 2nd column offset down
  },
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 110, // accommodate bottom floating tab bar
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 32,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    fontSize: scaleFont(FONTS.h3),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  emptySubtext: {
    fontSize: scaleFont(FONTS.caption),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  adminFab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentOlive,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: COLORS.accentOlive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  adminFabText: {
    color: COLORS.white,
    fontSize: scaleFont(FONTS.caption),
    fontWeight: FONTS.bold,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFDF3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: scaleFont(FONTS.h3),
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  fieldLabel: {
    fontSize: scaleFont(FONTS.small),
    fontWeight: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
});
