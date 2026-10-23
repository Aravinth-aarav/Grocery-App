/**
 * ProductsContext.js
 * Manages the AS Mart product catalog with AsyncStorage persistence.
 * Includes data versioning (PRODUCTS_VERSION = 2) to seamlessly upgrade
 * existing installations to the full 40+ item catalog without losing custom items.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import INITIAL_PRODUCTS from '../data/products';
import { saveData, getData } from '../utils/storage';

const ProductsContext = createContext();

export const PRODUCTS_VERSION = 2;
const STORAGE_KEY_PRODUCTS = 'grocery_products_list';
const STORAGE_KEY_PRODUCTS_VERSION = 'grocery_products_version';

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([...INITIAL_PRODUCTS]);
  const [loading, setLoading] = useState(true);
  const isLoadedRef = useRef(false);

  // Restore stored products with version migration on start
  useEffect(() => {
    async function loadProducts() {
      try {
        const storedVersion = await getData(STORAGE_KEY_PRODUCTS_VERSION, 1);
        const stored = await getData(STORAGE_KEY_PRODUCTS, null);

        if (storedVersion < PRODUCTS_VERSION || !stored || stored.length < 30) {
          // Upgrade: Keep any custom admin products created, but load the full 42 items
          const defaultIds = new Set(INITIAL_PRODUCTS.map((p) => p.id));
          const customAdminItems = Array.isArray(stored)
            ? stored.filter((p) => !defaultIds.has(p.id))
            : [];

          const merged = [...INITIAL_PRODUCTS, ...customAdminItems];
          setProducts(merged);
          await saveData(STORAGE_KEY_PRODUCTS, merged);
          await saveData(STORAGE_KEY_PRODUCTS_VERSION, PRODUCTS_VERSION);
        } else {
          setProducts(stored);
        }
      } catch (err) {
        console.error('[ProductsContext] Error loading products:', err);
      } finally {
        isLoadedRef.current = true;
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Save changes to storage whenever catalog is modified after initial load
  useEffect(() => {
    if (!isLoadedRef.current) return;
    saveData(STORAGE_KEY_PRODUCTS, products);
  }, [products]);

  /** Add a new product and persist */
  const addProduct = useCallback((product) => {
    const newProduct = { ...product, id: `prod-${Date.now()}` };
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  /** Edit an existing product by id and persist */
  const editProduct = useCallback((id, updates) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  /** Delete a product by id and persist */
  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /** Reset or refresh products */
  const refreshProducts = useCallback(async () => {
    setLoading(true);
    const stored = await getData(STORAGE_KEY_PRODUCTS, INITIAL_PRODUCTS);
    setProducts(stored);
    setLoading(false);
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        addProduct,
        editProduct,
        deleteProduct,
        refreshProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context)
    throw new Error('useProducts must be used within ProductsProvider');
  return context;
}

export default ProductsContext;
